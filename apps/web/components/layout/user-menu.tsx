"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, LogOut, UserRound } from "lucide-react";

import { cn } from "../../lib/utils";

export function userInitials(name: string | null | undefined, email: string) {
  const source = (name || email).trim();
  if (!source) return "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export function firstName(name: string | null | undefined, email: string) {
  const trimmed = name?.trim();
  if (trimmed) return trimmed.split(/\s+/)[0]!;
  return email.split("@")[0] || "there";
}

export function UserMenu({
  name,
  email,
  username,
  onSignOut,
}: {
  name: string;
  email: string;
  username: string | null;
  onSignOut: () => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const initials = userInitials(name, email);
  const handle = username ? `@${username}` : email;

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          "inline-flex h-9 items-center gap-2 rounded-full py-1 pr-2 pl-1 text-left transition-colors",
          open
            ? "bg-white shadow-[inset_0_0_0_1px_var(--atelier-line)]"
            : "hover:bg-white/70",
        )}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--atelier-accent)] text-[11px] font-semibold text-white">
          {initials}
        </span>
        <span className="hidden min-w-0 sm:block">
          <span className="block max-w-[9rem] truncate text-xs font-medium text-[var(--atelier-ink)]">
            {name || email}
          </span>
          <span className="block max-w-[9rem] truncate text-[10px] text-[var(--atelier-ink-muted)]">
            {handle}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "hidden h-3.5 w-3.5 text-[var(--atelier-ink-muted)] sm:block",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-full right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl bg-white py-1 shadow-[var(--atelier-shadow)] ring-1 ring-[var(--atelier-line)]"
        >
          <div className="border-b border-[var(--atelier-line)] px-4 py-3">
            <p className="truncate text-sm font-medium">{name || "Account"}</p>
            <p className="truncate text-xs text-[var(--atelier-ink-muted)]">
              {handle}
            </p>
          </div>
          <Link
            href="/auth/account"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--atelier-ink)] hover:bg-[var(--atelier-bg)]"
          >
            <UserRound className="h-4 w-4 text-[var(--atelier-ink-muted)]" />
            Account
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onSignOut();
            }}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-[var(--atelier-ink)] hover:bg-[var(--atelier-bg)]"
          >
            <LogOut className="h-4 w-4 text-[var(--atelier-ink-muted)]" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
