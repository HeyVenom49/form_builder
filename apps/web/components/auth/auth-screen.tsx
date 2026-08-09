"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

import { useSignin, useSignup } from "../../hook/api/auth";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { cn } from "../../lib/utils";

type AuthMode = "signin" | "signup";

export function AuthScreen({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const {
    loginWithEmailAndPasswordAsync,
    isPending: signinPending,
    isError: signinError,
    error: signinErr,
  } = useSignin();
  const {
    createUserWithEmailAndPasswordAsync,
    isPending: signupPending,
    isError: signupError,
    error: signupErr,
  } = useSignup();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const isPending = mode === "signin" ? signinPending : signupPending;
  const isError = mode === "signin" ? signinError : signupError;
  const error = mode === "signin" ? signinErr : signupErr;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (mode === "signin") {
        await loginWithEmailAndPasswordAsync({
          email: email.trim().toLowerCase(),
          password,
        });
        router.push("/workspace");
      } else {
        await createUserWithEmailAndPasswordAsync({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        });
        router.push("/create");
      }
    } catch {
      /* surfaced via isError */
    }
  }

  const fade = reduceMotion
    ? undefined
    : { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -4 } };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--atelier-bg)]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 20% 10%, rgba(27,107,90,0.12), transparent 55%), radial-gradient(ellipse 50% 40% at 90% 80%, rgba(20,20,20,0.04), transparent)",
        }}
      />
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16 lg:grid lg:grid-cols-2 lg:items-center lg:gap-20">
        <div className="mb-12 lg:mb-0">
          <Link href="/" className="font-display text-3xl tracking-tight">
            Atelier
          </Link>
          <h1 className="mt-10 font-display text-5xl leading-[1.05] tracking-tight text-[var(--atelier-ink)] sm:text-6xl">
            Design forms
            <br />
            people remember.
          </h1>
          <p className="mt-6 max-w-md text-lg text-[var(--atelier-ink-soft)]">
            {mode === "signin"
              ? "Welcome back. Your experiences are waiting."
              : "Create an account to design, preview, and share experiences."}
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="w-full max-w-md rounded-2xl bg-white/80 p-8 shadow-[var(--atelier-shadow)] backdrop-blur-sm"
        >
          <div className="flex gap-1 rounded-xl bg-[var(--atelier-bg)] p-1">
            <Link
              href="/auth/signin"
              className={cn(
                "flex-1 rounded-lg py-2 text-center text-sm font-medium transition-colors",
                mode === "signin"
                  ? "bg-white text-[var(--atelier-ink)] shadow-sm"
                  : "text-[var(--atelier-ink-muted)] hover:text-[var(--atelier-ink)]",
              )}
            >
              Sign in
            </Link>
            <Link
              href="/auth/signup"
              className={cn(
                "flex-1 rounded-lg py-2 text-center text-sm font-medium transition-colors",
                mode === "signup"
                  ? "bg-white text-[var(--atelier-ink)] shadow-sm"
                  : "text-[var(--atelier-ink-muted)] hover:text-[var(--atelier-ink)]",
              )}
            >
              Sign up
            </Link>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={mode}
              {...fade}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8"
            >
              <h2 className="text-xl font-semibold tracking-tight">
                {mode === "signin" ? "Sign in" : "Create your account"}
              </h2>
              <p className="mt-1 text-sm text-[var(--atelier-ink-muted)]">
                {mode === "signin"
                  ? "Use the email you signed up with."
                  : "A few details to get started."}
              </p>

              <div className="mt-8 space-y-4">
                {mode === "signup" && (
                  <label className="block">
                    <span className="mb-1.5 block text-sm text-[var(--atelier-ink-soft)]">
                      Name
                    </span>
                    <Input
                      required
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Rivera"
                    />
                  </label>
                )}
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
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      autoComplete={
                        mode === "signin" ? "current-password" : "new-password"
                      }
                      required
                      minLength={mode === "signup" ? 8 : undefined}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={
                        mode === "signup" ? "At least 8 characters" : "••••••••"
                      }
                      className="pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute top-1/2 right-3 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--atelier-ink-muted)] transition-colors hover:bg-black/[0.04] hover:text-[var(--atelier-ink)]"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      aria-pressed={showPassword}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </label>
              </div>

              {isError && (
                <p className="mt-4 text-sm text-[var(--atelier-danger)]">
                  {error?.message ||
                    (mode === "signin"
                      ? "We couldn't sign you in. Check your details and try again."
                      : "Something went wrong. Please try a different email.")}
                </p>
              )}

              <Button
                type="submit"
                className="mt-8 w-full"
                size="lg"
                disabled={isPending}
              >
                {isPending
                  ? mode === "signin"
                    ? "Signing in…"
                    : "Creating…"
                  : mode === "signin"
                    ? "Continue"
                    : "Create account"}
              </Button>

              {mode === "signin" && (
                <p className="mt-6 text-center text-sm text-[var(--atelier-ink-muted)]">
                  <Link
                    href="/auth/forgot-password"
                    className="text-[var(--atelier-accent)] underline-offset-4 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </form>
      </div>
    </div>
  );
}
