import { randomBytes } from "node:crypto";
import {
  and,
  db,
  desc,
  eq,
  formTable,
  isNull,
  ne,
  shareLinkTable,
} from "@repo/database";
import FormService from "../form";
import { hashPassword, verifyPassword } from "../utils/password-hasher";
import { slugify } from "../form/slug";
import {
  createShareLinkInput,
  resolveShareLinkInput,
  updateShareLinkInput,
  type CreateShareLinkType,
  type ResolveShareLinkType,
  type UpdateShareLinkType,
} from "./model";

function toPublicShareLink<T extends { passwordHash: string | null }>(link: T) {
  const { passwordHash, ...rest } = link;
  return {
    ...rest,
    hasPassword: Boolean(passwordHash),
  };
}

class ShareLinkService {
  private formService = new FormService();

  private async assertOwnedForm(ownerId: string, formId: string) {
    const [form] = await db
      .select({ id: formTable.id })
      .from(formTable)
      .where(
        and(
          eq(formTable.id, formId),
          eq(formTable.ownerId, ownerId),
          isNull(formTable.deletedAt),
        ),
      )
      .limit(1);

    if (!form) {
      throw new Error("Form not found");
    }

    return form;
  }

  private async assertOwnedShareLink(ownerId: string, shareLinkId: string) {
    const [row] = await db
      .select({
        link: shareLinkTable,
      })
      .from(shareLinkTable)
      .innerJoin(formTable, eq(shareLinkTable.formId, formTable.id))
      .where(
        and(
          eq(shareLinkTable.id, shareLinkId),
          eq(formTable.ownerId, ownerId),
          isNull(formTable.deletedAt),
        ),
      )
      .limit(1);

    if (!row) {
      throw new Error("Share link not found");
    }

    return row.link;
  }

  private async uniqueSlug(preferred?: string, excludeId?: string) {
    const base = preferred ? slugify(preferred) : randomBytes(6).toString("hex");
    const candidate = base.length >= 3 ? base : `${base}-link`;

    for (let attempt = 0; attempt < 20; attempt++) {
      const trySlug =
        attempt === 0
          ? candidate
          : `${candidate}-${randomBytes(2).toString("hex")}`;

      const conditions = [eq(shareLinkTable.slug, trySlug)];
      if (excludeId) {
        conditions.push(ne(shareLinkTable.id, excludeId));
      }

      const [existing] = await db
        .select({ id: shareLinkTable.id })
        .from(shareLinkTable)
        .where(and(...conditions))
        .limit(1);

      if (!existing) {
        return trySlug;
      }
    }

    throw new Error("Failed to allocate a unique share link slug");
  }

  public async createShareLink(ownerId: string, payload: CreateShareLinkType) {
    const input = await createShareLinkInput.parseAsync(payload);
    await this.assertOwnedForm(ownerId, input.formId);

    const slug = await this.uniqueSlug(input.slug);
    const passwordHash =
      input.password != null && input.password.length > 0
        ? await hashPassword(input.password)
        : null;

    const [created] = await db
      .insert(shareLinkTable)
      .values({
        formId: input.formId,
        slug,
        passwordHash,
        expiresAt: input.expiresAt ?? null,
        maxVisits: input.maxVisits ?? null,
      })
      .returning();

    if (!created) {
      throw new Error("Failed to create share link");
    }

    return toPublicShareLink(created);
  }

  public async listShareLinks(ownerId: string, formId: string) {
    await this.assertOwnedForm(ownerId, formId);

    const links = await db
      .select()
      .from(shareLinkTable)
      .where(eq(shareLinkTable.formId, formId))
      .orderBy(desc(shareLinkTable.createdAt));

    return links.map(toPublicShareLink);
  }

  public async updateShareLink(
    ownerId: string,
    shareLinkId: string,
    payload: UpdateShareLinkType,
  ) {
    const input = await updateShareLinkInput.parseAsync(payload);
    await this.assertOwnedShareLink(ownerId, shareLinkId);

    let slug: string | undefined;
    if (input.slug !== undefined) {
      slug = await this.uniqueSlug(input.slug, shareLinkId);
    }

    let passwordHash: string | null | undefined;
    if (input.password === null) {
      passwordHash = null;
    } else if (input.password !== undefined) {
      passwordHash = await hashPassword(input.password);
    }

    const [updated] = await db
      .update(shareLinkTable)
      .set({
        ...(slug !== undefined ? { slug } : {}),
        ...(passwordHash !== undefined ? { passwordHash } : {}),
        ...(input.expiresAt !== undefined ? { expiresAt: input.expiresAt } : {}),
        ...(input.maxVisits !== undefined ? { maxVisits: input.maxVisits } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      })
      .where(eq(shareLinkTable.id, shareLinkId))
      .returning();

    if (!updated) {
      throw new Error("Failed to update share link");
    }

    return toPublicShareLink(updated);
  }

  public async deactivateShareLink(ownerId: string, shareLinkId: string) {
    await this.assertOwnedShareLink(ownerId, shareLinkId);

    const [updated] = await db
      .update(shareLinkTable)
      .set({ isActive: false })
      .where(eq(shareLinkTable.id, shareLinkId))
      .returning();

    if (!updated) {
      throw new Error("Failed to deactivate share link");
    }

    return toPublicShareLink(updated);
  }

  public async deleteShareLink(ownerId: string, shareLinkId: string) {
    await this.assertOwnedShareLink(ownerId, shareLinkId);

    await db
      .delete(shareLinkTable)
      .where(eq(shareLinkTable.id, shareLinkId));

    return { ok: true as const };
  }

  public async resolveBySlug(payload: ResolveShareLinkType) {
    const input = await resolveShareLinkInput.parseAsync(payload);

    let [link] = await db
      .select()
      .from(shareLinkTable)
      .where(eq(shareLinkTable.slug, input.slug))
      .limit(1);

    // Fallback: published form.slug (publish used to skip creating share links)
    if (!link) {
      const [published] = await db
        .select({ id: formTable.id, slug: formTable.slug })
        .from(formTable)
        .where(
          and(
            eq(formTable.slug, input.slug),
            eq(formTable.status, "PUBLISHED"),
            isNull(formTable.deletedAt),
          ),
        )
        .limit(1);

      if (published) {
        const [existingForForm] = await db
          .select()
          .from(shareLinkTable)
          .where(eq(shareLinkTable.formId, published.id))
          .orderBy(desc(shareLinkTable.createdAt))
          .limit(1);

        if (existingForForm) {
          if (existingForForm.slug === published.slug) {
            link = { ...existingForForm, isActive: true };
            if (!existingForForm.isActive) {
              const [reactivated] = await db
                .update(shareLinkTable)
                .set({ isActive: true })
                .where(eq(shareLinkTable.id, existingForForm.id))
                .returning();
              link = reactivated ?? link;
            }
          } else {
            const [created] = await db
              .insert(shareLinkTable)
              .values({
                formId: published.id,
                slug: published.slug,
              })
              .returning();
            link = created;
          }
        } else {
          const [created] = await db
            .insert(shareLinkTable)
            .values({
              formId: published.id,
              slug: published.slug,
            })
            .returning();
          link = created;
        }
      }
    }

    if (!link || !link.isActive) {
      throw new Error("Share link not found");
    }

    if (link.expiresAt && link.expiresAt < new Date()) {
      throw new Error("This share link has expired");
    }

    if (link.maxVisits !== null && link.visitCount >= link.maxVisits) {
      throw new Error("This share link has reached its visit limit");
    }

    if (link.passwordHash) {
      if (!input.password) {
        throw new Error("Password is required for this share link");
      }

      const valid = await verifyPassword(link.passwordHash, input.password);
      if (!valid) {
        throw new Error("Invalid share link password");
      }
    }

    const form = await this.formService.getPublishedFormById(link.formId);

    const [bumped] = await db
      .update(shareLinkTable)
      .set({ visitCount: link.visitCount + 1 })
      .where(
        and(
          eq(shareLinkTable.id, link.id),
          eq(shareLinkTable.isActive, true),
        ),
      )
      .returning();

    return {
      shareLink: toPublicShareLink(bumped ?? link),
      form,
    };
  }
}

export default ShareLinkService;
