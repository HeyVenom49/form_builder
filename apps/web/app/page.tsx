"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

import { Button } from "../components/ui/button";
import { useUser } from "../hook/api/auth";

export default function HomePage() {
  const router = useRouter();
  const { user, isFetched } = useUser();

  useEffect(() => {
    if (!isFetched) return;
    if (user) router.replace("/workspace");
  }, [user, isFetched, router]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 50% -10%, rgba(27,107,90,0.14), transparent 55%), linear-gradient(180deg, #f6f6f4 0%, #efefec 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23141414' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="font-display text-2xl tracking-tight">Atelier</span>
        <div className="flex items-center gap-3">
          {user ? (
            <Link href="/workspace">
              <Button size="sm">Open workspace</Button>
            </Link>
          ) : (
            <>
              <Link href="/auth/signin">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm">Get started</Button>
              </Link>
            </>
          )}
        </div>
      </header>

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-88px)] max-w-6xl flex-col justify-center px-6 pt-8 pb-24">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-sm font-medium tracking-[0.14em] text-[var(--atelier-accent)] uppercase"
        >
          Atelier
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="mt-4 max-w-3xl font-display text-5xl leading-[1.05] tracking-tight text-[var(--atelier-ink)] sm:text-7xl"
        >
          Forms that feel
          <br />
          like experiences.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.12 }}
          className="mt-6 max-w-xl text-lg text-[var(--atelier-ink-soft)] sm:text-xl"
        >
          Design, theme, and share beautiful forms — with the calm of Notion and
          the craft of a studio.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.18 }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <Link href={user ? "/workspace" : "/auth/signup"}>
            <Button size="lg">
              {user ? "Continue to workspace" : "Start designing"}
            </Button>
          </Link>
          {!user && (
            <Link href="/workspace">
              <Button variant="secondary" size="lg">
                Open workspace
              </Button>
            </Link>
          )}
        </motion.div>
      </section>
    </div>
  );
}
