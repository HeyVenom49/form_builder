import {
  and,
  answerTable,
  db,
  desc,
  eq,
  fileTable,
  formTable,
  isNull,
  responseTable,
} from "@repo/database";
import {
  registerFileInput,
  type RegisterFileType,
} from "./model";

class FileService {
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

  public async registerFile(
    payload: RegisterFileType,
    opts?: { ownerId?: string | null },
  ) {
    const input = await registerFileInput.parseAsync(payload);

    if (!input.responseId) {
      throw new Error("A response id is required to register a file");
    }

    const [response] = await db
      .select({
        id: responseTable.id,
        formId: responseTable.formId,
        userId: responseTable.userId,
        status: responseTable.status,
      })
      .from(responseTable)
      .innerJoin(formTable, eq(responseTable.formId, formTable.id))
      .where(
        and(
          eq(responseTable.id, input.responseId),
          isNull(responseTable.deletedAt),
          isNull(formTable.deletedAt),
        ),
      )
      .limit(1);

    if (!response) {
      throw new Error("Response not found");
    }

    if (
      response.status !== "STARTED" &&
      response.status !== "PARTIAL"
    ) {
      throw new Error("This response can no longer accept files");
    }

    if (
      response.userId &&
      opts?.ownerId &&
      response.userId !== opts.ownerId
    ) {
      throw new Error("You cannot attach files to this response");
    }

    const formId = input.formId ?? response.formId;
    if (formId !== response.formId) {
      throw new Error("Response does not belong to the given form");
    }

    if (input.answerId) {
      const [answer] = await db
        .select({ id: answerTable.id, responseId: answerTable.responseId })
        .from(answerTable)
        .where(eq(answerTable.id, input.answerId))
        .limit(1);

      if (!answer) {
        throw new Error("Answer not found");
      }

      if (answer.responseId !== response.id) {
        throw new Error("Answer does not belong to the given response");
      }
    }

    const [created] = await db
      .insert(fileTable)
      .values({
        formId,
        ownerId: opts?.ownerId ?? null,
        responseId: response.id,
        answerId: input.answerId ?? null,
        provider: input.provider,
        objectKey: input.objectKey,
        url: input.url,
        originalFileName: input.originalFileName,
        mimeType: input.mimeType,
        size: input.size,
      })
      .returning();

    if (!created) {
      throw new Error("Failed to register file");
    }

    return created;
  }

  public async listFilesForForm(ownerId: string, formId: string) {
    await this.assertOwnedForm(ownerId, formId);

    return db
      .select()
      .from(fileTable)
      .where(and(eq(fileTable.formId, formId), isNull(fileTable.deletedAt)))
      .orderBy(desc(fileTable.createdAt));
  }

  public async getFile(fileId: string, opts?: { ownerId?: string | null }) {
    const [file] = await db
      .select()
      .from(fileTable)
      .where(and(eq(fileTable.id, fileId), isNull(fileTable.deletedAt)))
      .limit(1);

    if (!file) {
      throw new Error("File not found");
    }

    if (file.formId && opts?.ownerId) {
      const [owned] = await db
        .select({ id: formTable.id })
        .from(formTable)
        .where(
          and(
            eq(formTable.id, file.formId),
            eq(formTable.ownerId, opts.ownerId),
            isNull(formTable.deletedAt),
          ),
        )
        .limit(1);

      if (!owned && file.ownerId !== opts.ownerId) {
        throw new Error("File not found");
      }
    }

    return file;
  }

  public async deleteFile(ownerId: string, fileId: string) {
    const file = await this.getFile(fileId, { ownerId });

    if (file.formId) {
      await this.assertOwnedForm(ownerId, file.formId);
    } else if (file.ownerId !== ownerId) {
      throw new Error("File not found");
    }

    await db
      .update(fileTable)
      .set({ deletedAt: new Date() })
      .where(eq(fileTable.id, fileId));

    return { ok: true as const };
  }
}

export default FileService;
