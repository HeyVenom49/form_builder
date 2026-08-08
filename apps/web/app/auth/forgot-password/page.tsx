"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";

import { useRequestPasswordReset } from "../../../hook/api/auth";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";

export default function ForgotPasswordPage() {
  const { requestPasswordResetAsync, isPending, isSuccess, error } =
    useRequestPasswordReset();
  const [email, setEmail] = useState("");

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Link href="/" className="font-display text-3xl">
          Atelier
        </Link>
        <h1 className="mt-8 font-display text-4xl tracking-tight">
          Reset password
        </h1>
        <p className="mt-2 text-[var(--atelier-ink-soft)]">
          We&apos;ll email a reset link if that account exists.
        </p>
        <form
          className="mt-8 space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            await requestPasswordResetAsync({ email });
          }}
        >
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@studio.com"
          />
          {error && (
            <p className="text-sm text-[var(--atelier-danger)]">{error.message}</p>
          )}
          {isSuccess && (
            <p className="text-sm text-[var(--atelier-accent)]">
              Check your inbox for the next step.
            </p>
          )}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Sending…" : "Send reset link"}
          </Button>
        </form>
        <p className="mt-6 text-sm text-[var(--atelier-ink-muted)]">
          <Link href="/auth/signin">Back to sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
