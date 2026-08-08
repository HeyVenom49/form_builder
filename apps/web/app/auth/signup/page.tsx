"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";

import { useSignup } from "../../../hook/api/auth";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";

export default function SignUpPage() {
  const router = useRouter();
  const { createUserWithEmailAndPasswordAsync, isPending, isError, error } =
    useSignup();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createUserWithEmailAndPasswordAsync({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      router.push("/create");
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
            "radial-gradient(ellipse 70% 50% at 80% 0%, rgba(27,107,90,0.1), transparent 50%), radial-gradient(ellipse 40% 30% at 10% 90%, rgba(20,20,20,0.03), transparent)",
        }}
      />
      <div className="relative mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link href="/" className="font-display text-3xl tracking-tight">
            Atelier
          </Link>
          <h1 className="mt-8 font-display text-4xl tracking-tight sm:text-5xl">
            Begin your atelier
          </h1>
          <p className="mt-3 text-[var(--atelier-ink-soft)]">
            Create an account to design, preview, and share experiences.
          </p>
        </motion.div>

        <motion.form
          onSubmit={onSubmit}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 space-y-4"
        >
          <label className="block">
            <span className="mb-1.5 block text-sm text-[var(--atelier-ink-soft)]">
              Name
            </span>
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Rivera"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm text-[var(--atelier-ink-soft)]">
              Email
            </span>
            <Input
              type="email"
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
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
            />
          </label>

          {isError && (
            <p className="text-sm text-[var(--atelier-danger)]">
              {error?.message ||
                "Something went wrong. Please try a different email."}
            </p>
          )}

          <Button
            type="submit"
            className="mt-4 w-full"
            size="lg"
            disabled={isPending}
          >
            {isPending ? "Creating…" : "Create account"}
          </Button>

          <p className="pt-2 text-center text-sm text-[var(--atelier-ink-muted)]">
            Already have an account?{" "}
            <Link
              href="/auth/signin"
              className="text-[var(--atelier-accent)] underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </motion.form>
      </div>
    </div>
  );
}
