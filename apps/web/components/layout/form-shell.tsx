"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { cn } from "../../lib/utils";

export function FormShell({
  form,
  children,
  trailing,
  subtitle,
}: {
  form: {
    id: string;
    title: string;
    status: string;
    themeId?: string;
  };
  children: React.ReactNode;
  trailing?: React.ReactNode;
  subtitle?: string;
}) {
  const pathname = usePathname();
  const base = `/forms/${form.id}`;
  const tabs = [
    { href: `${base}/edit`, label: "Edit", match: "/edit" },
    { href: `${base}/responses`, label: "Responses", match: "/responses" },
    { href: `${base}/analytics`, label: "Insights", match: "/analytics" },
  ];
  const isEdit = pathname.includes("/edit");

  return (
    <div
      className={cn(
        "flex flex-col bg-[var(--atelier-bg)]",
        isEdit ? "h-screen overflow-hidden" : "min-h-screen",
      )}
    >
      <header className="shrink-0 border-b border-[var(--atelier-line)] bg-[var(--atelier-bg)]/90 backdrop-blur-md">
        <div className="flex h-14 items-center gap-2 px-3 sm:px-4">
          <Link
            href="/workspace"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--atelier-ink-muted)]"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{form.title}</p>
            <p className="truncate text-xs text-[var(--atelier-ink-muted)]">
              {subtitle ?? form.status}
            </p>
          </div>
          <nav className="mr-1 hidden items-center gap-1 md:flex">
            {tabs.map((tab) => {
              const active = pathname.includes(tab.match);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    "rounded-lg px-2.5 py-1.5 text-sm",
                    active
                      ? "bg-white shadow-[inset_0_0_0_1px_var(--atelier-line)]"
                      : "text-[var(--atelier-ink-muted)]",
                  )}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
          {trailing}
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-2 md:hidden">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium",
                pathname.includes(tab.match)
                  ? "bg-[var(--atelier-ink)] text-white"
                  : "bg-white",
              )}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </header>
      {children}
    </div>
  );
}
