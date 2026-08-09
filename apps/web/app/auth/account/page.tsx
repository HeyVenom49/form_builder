"use client";

import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Mail, Shield } from "lucide-react";

import { AppChrome } from "../../../components/layout/app-chrome";
import { userInitials } from "../../../components/layout/user-menu";
import {
  useChangePassword,
  useLogoutAll,
  useRequestEmailVerification,
  useResetPassword,
  useUser,
  useVerifyEmail,
} from "../../../hook/api/auth";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Skeleton } from "../../../components/ui/skeleton";

function VerifyFromQuery() {
  const params = useSearchParams();
  const token = params.get("verify");
  const { verifyEmailAsync, isPending, isSuccess, error } = useVerifyEmail();
  if (!token) return null;
  return (
    <div className="mt-4 space-y-2">
      <Button disabled={isPending} onClick={() => verifyEmailAsync({ token })}>
        Verify email token
      </Button>
      {error && (
        <p className="text-sm text-[var(--atelier-danger)]">{error.message}</p>
      )}
      {isSuccess && (
        <p className="text-sm text-[var(--atelier-accent)]">Email verified.</p>
      )}
    </div>
  );
}

function ResetFromQuery() {
  const params = useSearchParams();
  const token = params.get("token");
  const { resetPasswordAsync, isPending, isSuccess, error } =
    useResetPassword();
  const [password, setPassword] = useState("");
  if (!token) return null;
  return (
    <form
      className="mt-4 space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        await resetPasswordAsync({ token, newPassword: password });
      }}
    >
      <Input
        type="password"
        required
        minLength={8}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="New password"
      />
      <Button type="submit" disabled={isPending}>
        Set new password
      </Button>
      {error && (
        <p className="text-sm text-[var(--atelier-danger)]">{error.message}</p>
      )}
      {isSuccess && (
        <p className="text-sm text-[var(--atelier-accent)]">Password updated.</p>
      )}
    </form>
  );
}

export default function AccountSecurityPage() {
  const router = useRouter();
  const { user, isFetched } = useUser();
  const { changePasswordAsync, isPending: changing, error: changeError } =
    useChangePassword();
  const { logoutAllAsync, isPending: loggingOut } = useLogoutAll();
  const { requestEmailVerificationAsync, isPending: verifying } =
    useRequestEmailVerification();

  const [currentPassword, setCurrent] = useState("");
  const [newPassword, setNew] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isFetched) return;
    if (!user) router.replace("/auth/signin");
  }, [user, isFetched, router]);

  if (!isFetched || !user) {
    return (
      <AppChrome>
        <div className="mx-auto max-w-2xl px-6 py-12">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="mt-8 h-40 w-full rounded-2xl" />
        </div>
      </AppChrome>
    );
  }

  const verified = Boolean(user.emailVerifiedAt);
  const initials = userInitials(user.name, user.email);

  return (
    <AppChrome>
      <div className="mx-auto max-w-2xl px-6 py-12">
        <p className="text-sm tracking-[0.12em] text-[var(--atelier-accent)] uppercase">
          Account
        </p>
        <h1 className="mt-2 font-display text-4xl tracking-tight">
          Your profile
        </h1>
        <p className="mt-2 text-[var(--atelier-ink-soft)]">
          Manage how you appear and keep your workspace secure.
        </p>

        <section className="mt-10 flex items-start gap-4 rounded-2xl bg-white p-5 shadow-[inset_0_0_0_1px_var(--atelier-line)]">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--atelier-accent)] text-lg font-semibold text-white">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-2xl tracking-tight">
              {user.name}
            </p>
            {user.username ? (
              <p className="mt-0.5 text-sm text-[var(--atelier-ink-muted)]">
                @{user.username}
              </p>
            ) : null}
            <p className="mt-3 flex items-center gap-2 text-sm text-[var(--atelier-ink-soft)]">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{user.email}</span>
            </p>
            <p className="mt-2 flex items-center gap-2 text-sm">
              {verified ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-[var(--atelier-accent)]" />
                  <span className="text-[var(--atelier-accent)]">
                    Email verified
                  </span>
                </>
              ) : (
                <>
                  <Shield className="h-3.5 w-3.5 text-[var(--atelier-ink-muted)]" />
                  <span className="text-[var(--atelier-ink-muted)]">
                    Email not verified yet
                  </span>
                </>
              )}
            </p>
          </div>
          <Link
            href="/workspace"
            className="hidden text-sm text-[var(--atelier-ink-muted)] hover:text-[var(--atelier-ink)] sm:inline"
          >
            Back to workspace
          </Link>
        </section>

        <section className="mt-8 rounded-2xl bg-white p-5 shadow-[inset_0_0_0_1px_var(--atelier-line)]">
          <h2 className="font-medium">Change password</h2>
          <p className="mt-1 text-sm text-[var(--atelier-ink-muted)]">
            Use a strong password you don’t reuse elsewhere.
          </p>
          <div className="mt-4 space-y-3">
            <Input
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrent(e.target.value)}
              autoComplete="current-password"
            />
            <Input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNew(e.target.value)}
              autoComplete="new-password"
              minLength={8}
            />
            <Button
              disabled={changing || !currentPassword || newPassword.length < 8}
              onClick={async () => {
                setMessage(null);
                try {
                  await changePasswordAsync({ currentPassword, newPassword });
                  setCurrent("");
                  setNew("");
                  setMessage("Password changed.");
                } catch {
                  /* surfaced via changeError */
                }
              }}
            >
              Update password
            </Button>
            {changeError && (
              <p className="text-sm text-[var(--atelier-danger)]">
                {changeError.message}
              </p>
            )}
          </div>
        </section>

        <section className="mt-6 rounded-2xl bg-white p-5 shadow-[inset_0_0_0_1px_var(--atelier-line)]">
          <h2 className="font-medium">Email verification</h2>
          <p className="mt-1 text-sm text-[var(--atelier-ink-muted)]">
            {verified
              ? "Your email is already verified."
              : "Confirm your email so we can recover your account if needed."}
          </p>
          {!verified && (
            <Button
              className="mt-4"
              variant="secondary"
              disabled={verifying}
              onClick={async () => {
                await requestEmailVerificationAsync();
                setMessage("Verification email sent.");
              }}
            >
              Send verification email
            </Button>
          )}
          <Suspense>
            <VerifyFromQuery />
          </Suspense>
        </section>

        <section className="mt-6 rounded-2xl bg-white p-5 shadow-[inset_0_0_0_1px_var(--atelier-line)]">
          <h2 className="font-medium">Sessions</h2>
          <p className="mt-1 text-sm text-[var(--atelier-ink-muted)]">
            Sign out on every device if you think someone else has access.
          </p>
          <Button
            className="mt-4"
            variant="danger"
            disabled={loggingOut}
            onClick={async () => {
              await logoutAllAsync();
              setMessage("Signed out everywhere.");
              router.replace("/auth/signin");
            }}
          >
            Sign out all devices
          </Button>
        </section>

        <section className="mt-6 rounded-2xl bg-white p-5 shadow-[inset_0_0_0_1px_var(--atelier-line)]">
          <h2 className="font-medium">Reset with email token</h2>
          <p className="mt-1 text-sm text-[var(--atelier-ink-muted)]">
            If you arrived here from a password-reset email, set a new password
            below.
          </p>
          <Suspense>
            <ResetFromQuery />
          </Suspense>
        </section>

        {message && (
          <p className="mt-6 text-sm text-[var(--atelier-accent)]">{message}</p>
        )}
      </div>
    </AppChrome>
  );
}
