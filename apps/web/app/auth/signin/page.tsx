"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";

import { useSignin } from "../../../hook/api/auth";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";

export default function SignInPage() {
  const router = useRouter();
  const { loginWithEmailAndPasswordAsync, isPending, isError, error } =
    useSignin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await loginWithEmailAndPasswordAsync({
        email: email.trim().toLowerCase(),
        password,
      });
      router.push("/workspace");
    } catch {
      /* surfaced via isError */
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 20% 10%, rgba(27,107,90,0.12), transparent 55%), radial-gradient(ellipse 50% 40% at 90% 80%, rgba(20,20,20,0.04), transparent)",
        }}
      />
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16 lg:grid lg:grid-cols-2 lg:items-center lg:gap-20">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 lg:mb-0"
        >
          <Link href="/" className="font-display text-3xl tracking-tight">
            Atelier
          </Link>
          <h1 className="mt-10 font-display text-5xl leading-[1.05] tracking-tight text-[var(--atelier-ink)] sm:text-6xl">
            Design forms
            <br />
            people remember.
          </h1>
          <p className="mt-6 max-w-md text-lg text-[var(--atelier-ink-soft)]">
            Welcome back. Your experiences are waiting.
          </p>
        </motion.div>

        <motion.form
          onSubmit={onSubmit}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md rounded-2xl bg-white/80 p-8 shadow-[var(--atelier-shadow)] backdrop-blur-sm"
        >
          <h2 className="text-xl font-semibold tracking-tight">Sign in</h2>
          <p className="mt-1 text-sm text-[var(--atelier-ink-muted)]">
            Use the email you signed up with.
          </p>

          <div className="mt-8 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm text-[var(--atelier-ink-soft)]">
                Email
              </span>
              <Input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@studio.com"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm text-[var(--atelier-ink-soft)]">
                Password
              </span>
              <Input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </label>
          </div>

          {isError && (
            <p className="mt-4 text-sm text-[var(--atelier-danger)]">
              {error?.message ||
                "We couldn't sign you in. Check your details and try again."}
            </p>
          )}

          <Button
            type="submit"
            className="mt-8 w-full"
            size="lg"
            disabled={isPending}
          >
            {isPending ? "Signing in…" : "Continue"}
          </Button>

          <p className="mt-6 text-center text-sm text-[var(--atelier-ink-muted)]">
            <Link
              href="/auth/forgot-password"
              className="text-[var(--atelier-accent)] underline-offset-4 hover:underline"
            >
              Forgot password?
            </Link>
          </p>

          <p className="mt-4 text-center text-sm text-[var(--atelier-ink-muted)]">
            New here?{" "}
            <Link
              href="/auth/signup"
              className="text-[var(--atelier-accent)] underline-offset-4 hover:underline"
            >
              Create an account
            </Link>
          </p>
        </motion.form>
      </div>
    </div>
  );
}
