import Link from "next/link";

const FOOTER = [
  {
    title: "Product",
    links: [
      { href: "#product", label: "Product" },
      { href: "#examples", label: "Examples" },
      { href: "#templates", label: "Templates" },
      { href: "#pricing", label: "Pricing" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "#", label: "Documentation" },
      { href: "#", label: "Help" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "#", label: "About" },
      { href: "#", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "#", label: "Privacy" },
      { href: "#", label: "Terms" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--atelier-line)] bg-[var(--atelier-bg)] py-16">
      <div className="landing-container">
        <div className="flex flex-col gap-12 sm:flex-row sm:justify-between">
          <div>
            <Link
              href="/"
              className="font-display text-2xl tracking-tight text-[var(--atelier-ink)]"
            >
              Atelier
            </Link>
            <p className="mt-3 max-w-xs text-sm text-[var(--atelier-ink-muted)]">
              Forms people actually want to fill out.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4 sm:gap-14">
            {FOOTER.map((group) => (
              <div key={group.title}>
                <p className="text-xs font-medium tracking-[0.12em] uppercase text-[var(--atelier-ink-muted)]">
                  {group.title}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-[var(--atelier-ink-soft)] transition-colors hover:text-[var(--atelier-ink)]"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-14 text-sm text-[var(--atelier-ink-muted)]">
          © {new Date().getFullYear()} Atelier
        </p>
      </div>
    </footer>
  );
}
