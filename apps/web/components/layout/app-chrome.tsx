"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "../../lib/utils";
import { useLogout, useUser } from "../../hook/api/auth";
import { Button } from "../ui/button";
import { UserMenu } from "./user-menu";

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useUser();
  const { logout } = useLogout();

  const links = [
    { href: "/workspace", label: "Workspace" },
    { href: "/create", label: "Create" },
  ];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-[var(--atelier-line)] bg-[var(--atelier-bg)]/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-10">
            <Link href="/workspace" className="group flex items-baseline gap-2">
              <span className="font-display text-2xl tracking-tight text-[var(--atelier-ink)]">
                Atelier
              </span>
            </Link>
            <nav className="hidden items-center gap-1 sm:flex">
              {links.map((link) => {
                const active = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm transition-colors",
                      active
                        ? "text-[var(--atelier-ink)]"
                        : "text-[var(--atelier-ink-muted)] hover:text-[var(--atelier-ink)]",
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/create">
              <Button size="sm">New experience</Button>
            </Link>
            {user ? (
              <UserMenu
                name={user.name}
                email={user.email}
                username={user.username}
                onSignOut={() => logout()}
              />
            ) : (
              <Link href="/auth/signin">
                <Button variant="secondary" size="sm">
                  Sign in
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
