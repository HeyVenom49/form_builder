"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";

import { AppChrome } from "../../components/layout/app-chrome";
import { IntentIllustration } from "../../components/illustrations/intent";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { themes } from "../../lib/design-tokens";
import { themeKeyFromDescription } from "../../lib/form-mapper";
import { useUser } from "../../hook/api/auth";
import { useDeleteForm, useListForms } from "../../hook/api/form";
import {
  useAcceptInvite,
  useDeclineInvite,
  useMyInvites,
  useSharedWithMe,
} from "../../hook/api/collaborator";
import { useMyThemes } from "../../hook/api/theme";

function FormCover({
  formId,
  title,
  description,
  background,
  surface,
  text,
  primary,
  muted,
}: {
  formId: string;
  title: string;
  description: string | null;
  background: string;
  surface: string;
  text: string;
  primary: string;
  muted: string;
}) {
  return (
    <Link
      href={`/forms/${formId}/edit`}
      className="group block overflow-hidden rounded-2xl transition-transform duration-300 hover:-translate-y-0.5"
    >
      <div
        className="relative aspect-[4/3] overflow-hidden px-5 pt-5"
        style={{ background }}
      >
        <div
          className="h-full rounded-t-xl px-4 pt-4 shadow-[var(--atelier-shadow)]"
          style={{ background: surface, color: text }}
        >
          <p className="truncate font-display text-lg leading-snug">{title}</p>
          <p className="mt-1 truncate text-xs" style={{ color: muted }}>
            {description || "No description"}
          </p>
          <div
            className="mt-4 h-8 rounded-md"
            style={{
              background,
              boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08)",
            }}
          />
          <div
            className="mt-3 h-7 w-20 rounded-md"
            style={{ background: primary }}
          />
        </div>
      </div>
      <div className="bg-white px-5 py-4">
        <h2 className="truncate font-medium tracking-tight">{title}</h2>
      </div>
    </Link>
  );
}

export default function WorkspacePage() {
  const router = useRouter();
  const { user, isLoading: userLoading, isFetched } = useUser();
  const { forms, isLoading, error } = useListForms(!!user);
  const { deleteFormAsync } = useDeleteForm();
  const { invites } = useMyInvites(!!user);
  const { shared } = useSharedWithMe(!!user);
  const { themes: myThemes } = useMyThemes(!!user);
  const { acceptInviteAsync, isPending: accepting } = useAcceptInvite();
  const { declineInviteAsync, isPending: declining } = useDeclineInvite();
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteBusyId, setInviteBusyId] = useState<string | null>(null);

  const themePreviewById = useMemo(() => {
    const map = new Map<
      string,
      {
        background: string;
        surface: string;
        text: string;
        primary: string;
        muted: string;
      }
    >();
    const fallback = themes.minimal;
    for (const t of myThemes ?? []) {
      const key = themeKeyFromDescription(t.description);
      const token = key ? themes[key] : null;
      map.set(t.id, {
        background: t.backgroundColor || token?.background || fallback.background,
        surface: t.secondaryColor || token?.surface || fallback.surface,
        text: t.textColor || token?.text || fallback.text,
        primary: t.primaryColor || token?.primary || fallback.primary,
        muted: token?.textMuted || fallback.textMuted,
      });
    }
    return map;
  }, [myThemes]);

  useEffect(() => {
    if (!isFetched) return;
    if (!user) router.replace("/auth/signin");
  }, [user, isFetched, router]);

  const fallback = themes.minimal;

  return (
    <AppChrome>
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm tracking-[0.12em] text-[var(--atelier-accent)] uppercase">
              Workspace
            </p>
            <h1 className="mt-2 font-display text-4xl tracking-tight sm:text-5xl">
              Your experiences
            </h1>
            <p className="mt-2 max-w-lg text-[var(--atelier-ink-soft)]">
              Synced with your Atelier account.
            </p>
          </div>
          <Link href="/create">
            <Button size="lg">What will you create?</Button>
          </Link>
        </div>

        {invites && invites.length > 0 && (
          <section className="mt-10 rounded-2xl bg-white px-5 py-4 shadow-[inset_0_0_0_1px_var(--atelier-line)]">
            <h2 className="font-medium">Pending invites</h2>
            {inviteError && (
              <p className="mt-2 text-sm text-[var(--atelier-danger)]">
                {inviteError}
              </p>
            )}
            <ul className="mt-3 space-y-2">
              {invites.map((inv) => (
                <li
                  key={inv.id}
                  className="flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--atelier-ink-soft)]"
                >
                  <span>
                    {inv.form?.title ?? inv.user?.email ?? inv.id} · {inv.role}
                  </span>
                  <span className="flex gap-2">
                    <Button
                      size="sm"
                      disabled={
                        inviteBusyId === inv.id && (accepting || declining)
                      }
                      onClick={async () => {
                        setInviteError(null);
                        setInviteBusyId(inv.id);
                        try {
                          await acceptInviteAsync({ id: inv.id });
                        } catch (e) {
                          setInviteError(
                            e instanceof Error
                              ? e.message
                              : "Could not accept invite",
                          );
                        } finally {
                          setInviteBusyId(null);
                        }
                      }}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={
                        inviteBusyId === inv.id && (accepting || declining)
                      }
                      onClick={async () => {
                        setInviteError(null);
                        setInviteBusyId(inv.id);
                        try {
                          await declineInviteAsync({ id: inv.id });
                        } catch (e) {
                          setInviteError(
                            e instanceof Error
                              ? e.message
                              : "Could not decline invite",
                          );
                        } finally {
                          setInviteBusyId(null);
                        }
                      }}
                    >
                      Decline
                    </Button>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {userLoading || !isFetched || !user || isLoading ? (
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="overflow-hidden rounded-2xl bg-white">
                <Skeleton className="aspect-[4/3] w-full rounded-none" />
                <div className="px-5 py-4">
                  <Skeleton className="h-5 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="mt-14 text-[var(--atelier-danger)]">
            {error.message || "Could not load forms. Is the API running?"}
          </p>
        ) : !forms?.length ? (
          <div className="mt-20 flex flex-col items-center text-center">
            <div className="h-40 w-56">
              <IntentIllustration variant="empty" />
            </div>
            <h2 className="mt-8 font-display text-3xl">Nothing here yet</h2>
            <p className="mt-2 max-w-sm text-[var(--atelier-ink-soft)]">
              Your first experience is one beautiful choice away.
            </p>
            <Link href="/create" className="mt-8">
              <Button>Start creating</Button>
            </Link>
          </div>
        ) : (
          <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {forms.map((form, i) => {
              const preview = form.themeId
                ? themePreviewById.get(form.themeId)
                : undefined;
              return (
                <motion.li
                  key={form.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i, 8) * 0.03 }}
                  className="group relative"
                >
                  <FormCover
                    formId={form.id}
                    title={form.title}
                    description={form.description}
                    background={preview?.background ?? fallback.background}
                    surface={preview?.surface ?? fallback.surface}
                    text={preview?.text ?? fallback.text}
                    primary={preview?.primary ?? fallback.primary}
                    muted={preview?.muted ?? fallback.textMuted}
                  />
                  <div className="absolute top-3 right-3 opacity-0 transition group-hover:opacity-100">
                    <button
                      type="button"
                      title="Delete"
                      onClick={async (e) => {
                        e.preventDefault();
                        if (!window.confirm(`Delete "${form.title}"?`)) return;
                        await deleteFormAsync({ id: form.id });
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-[var(--atelier-ink-soft)] shadow-sm hover:text-[var(--atelier-danger)]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="mt-2 px-1 text-xs text-[var(--atelier-ink-muted)]">
                    {form.status}
                    {" · "}
                    {formatDistanceToNow(new Date(form.updatedAt), {
                      addSuffix: true,
                    })}
                  </p>
                </motion.li>
              );
            })}
          </ul>
        )}

        {shared && shared.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-3xl tracking-tight">
              Shared with you
            </h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {shared.map((f) => (
                <li key={f.id}>
                  <Link
                    href={`/forms/${f.formId}/edit`}
                    className="block rounded-xl bg-white px-5 py-4 shadow-[inset_0_0_0_1px_var(--atelier-line)]"
                  >
                    <p className="font-medium">
                      {f.form?.title ?? "Shared form"}
                    </p>
                    <p className="text-sm text-[var(--atelier-ink-muted)]">
                      {f.role} · {f.form?.status}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </AppChrome>
  );
}
