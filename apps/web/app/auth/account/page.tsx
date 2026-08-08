"use client";

import Link from "next/link";
import { useState } from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import {
  useChangePassword,
  useLogoutAll,
  useRequestEmailVerification,
  useResetPassword,
  useVerifyEmail,
} from "../../../hook/api/auth";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";

function VerifyFromQuery() {
  const params = useSearchParams();
  const token = params.get("verify");
  const { verifyEmailAsync, isPending, isSuccess, error } = useVerifyEmail();
  if (!token) return null;
  return (
    <div className="mt-4 space-y-2">
      <Button
        disabled={isPending}
        onClick={() => verifyEmailAsync({ token })}
      >
        Verify email token
      </Button>
      {error && <p className="text-sm text-[var(--atelier-danger)]">{error.message}</p>}
      {isSuccess && (
        <p className="text-sm text-[var(--atelier-accent)]">Email verified.</p>
      )}
    </div>
  );
}

function ResetFromQuery() {
  const params = useSearchParams();
  const token = params.get("token");
  const { resetPasswordAsync, isPending, isSuccess, error } = useResetPassword();
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
      {error && <p className="text-sm text-[var(--atelier-danger)]">{error.message}</p>}
      {isSuccess && (
        <p className="text-sm text-[var(--atelier-accent)]">Password updated.</p>
      )}
    </form>
  );
}

export default function AccountSecurityPage() {
  const { changePasswordAsync, isPending: changing } = useChangePassword();
  const { logoutAllAsync, isPending: loggingOut } = useLogoutAll();
  const { requestEmailVerificationAsync, isPending: verifying } =
    useRequestEmailVerification();

  const [currentPassword, setCurrent] = useState("");
  const [newPassword, setNew] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <Link href="/workspace" className="font-display text-3xl">
        Atelier
      </Link>
      <h1 className="mt-8 font-display text-4xl">Account</h1>

      <section className="mt-10 space-y-4">
        <h2 className="font-medium">Change password</h2>
        <Input
          type="password"
          placeholder="Current password"
          value={currentPassword}
          onChange={(e) => setCurrent(e.target.value)}
        />
        <Input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNew(e.target.value)}
        />
        <Button
          disabled={changing}
          onClick={async () => {
            await changePasswordAsync({ currentPassword, newPassword });
            setMessage("Password changed.");
          }}
        >
          Update password
        </Button>
      </section>

      <section className="mt-12 space-y-3">
        <h2 className="font-medium">Email verification</h2>
        <Button
          variant="secondary"
          disabled={verifying}
          onClick={async () => {
            await requestEmailVerificationAsync();
            setMessage("Verification email sent.");
          }}
        >
          Send verification email
        </Button>
        <Suspense>
          <VerifyFromQuery />
        </Suspense>
      </section>

      <section className="mt-12 space-y-3">
        <h2 className="font-medium">Sessions</h2>
        <Button
          variant="danger"
          disabled={loggingOut}
          onClick={async () => {
            await logoutAllAsync();
            setMessage("Signed out everywhere.");
          }}
        >
          Sign out all devices
        </Button>
      </section>

      <section className="mt-12">
        <h2 className="font-medium">Reset with email token</h2>
        <Suspense>
          <ResetFromQuery />
        </Suspense>
      </section>

      {message && (
        <p className="mt-6 text-sm text-[var(--atelier-accent)]">{message}</p>
      )}
    </div>
  );
}
