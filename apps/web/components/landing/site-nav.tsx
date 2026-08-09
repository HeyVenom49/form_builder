"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useUser } from "../../hook/api/auth";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

const NAV_LINKS = [
  { href: "#product", label: "Product" },
  { href: "#examples", label: "Examples" },
  { href: "#templates", label: "Templates" },
  { href: "#pricing", label: "Pricing" },
] as const;

export function SiteNav() {
  const { user } = useUser();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const createHref = user ? "/create" : "/auth/signup";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-[height,background,box-shadow,backdrop-filter] duration-300 ease-[var(--atelier-ease)]",
        scrolled
          ? "border-b border-[var(--atelier-line)] bg-[var(--atelier-bg)]/88 backdrop-blur-md"
          : "bg-transparent",
      )}
    >
      <div
        className={cn(
          "landing-container grid grid-cols-[1fr_auto] items-center gap-4 transition-[height] duration-300 md:grid-cols-[1fr_auto_1fr]",
          scrolled ? "h-14" : "h-[4.25rem]",
        )}
      >
        <Link
          href="/"
          className="font-display text-[1.65rem] tracking-tight text-[var(--atelier-ink)]"
        >
          Atelier
        </Link>

        <nav
          className="hidden items-center justify-center gap-7 md:flex"
          aria-label="Primary"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[13.5px] text-[var(--atelier-ink-soft)] transition-colors hover:text-[var(--atelier-ink)]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-2 sm:gap-3">
          {user ? (
            <Link
              href="/workspace"
              className="hidden text-[13.5px] text-[var(--atelier-ink-soft)] transition-colors hover:text-[var(--atelier-ink)] sm:inline"
            >
              Workspace
            </Link>
          ) : (
            <Link
              href="/auth/signin"
              className="hidden text-[13.5px] text-[var(--atelier-ink-soft)] transition-colors hover:text-[var(--atelier-ink)] sm:inline"
            >
              Log in
            </Link>
          )}
          <Link href={createHref}>
            <Button size="sm">Create a form</Button>
          </Link>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[var(--atelier-ink)] md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">Menu</span>
            <span aria-hidden className="flex flex-col gap-1.5">
              <span
                className={cn(
                  "block h-px w-4 bg-current transition-transform",
                  open && "translate-y-[3.5px] rotate-45",
                )}
              />
              <span
                className={cn(
                  "block h-px w-4 bg-current transition-opacity",
                  open && "opacity-0",
                )}
              />
              <span
                className={cn(
                  "block h-px w-4 bg-current transition-transform",
                  open && "-translate-y-[3.5px] -rotate-45",
                )}
              />
            </span>
          </button>
        </div>
      </div>

      {open && (
        <div
          id="mobile-nav"
          className="border-t border-[var(--atelier-line)] bg-[var(--atelier-bg)] px-5 py-4 md:hidden"
        >
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2.5 text-sm text-[var(--atelier-ink-soft)] hover:bg-black/[0.03] hover:text-[var(--atelier-ink)]"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            {!user && (
              <Link
                href="/auth/signin"
                className="rounded-lg px-3 py-2.5 text-sm text-[var(--atelier-ink-soft)] hover:bg-black/[0.03]"
                onClick={() => setOpen(false)}
              >
                Log in
              </Link>
            )}
            {user && (
              <Link
                href="/workspace"
                className="rounded-lg px-3 py-2.5 text-sm text-[var(--atelier-ink-soft)] hover:bg-black/[0.03]"
                onClick={() => setOpen(false)}
              >
                Workspace
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
