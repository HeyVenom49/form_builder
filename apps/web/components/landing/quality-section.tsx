import { LandingHeader, LandingSection } from "./section";

export function QualitySection() {
  return (
    <LandingSection tone="soft">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <LandingHeader
          title="Beautiful is only the beginning."
          description="Atelier gently checks the things that help people finish — clarity, balance, mobile comfort, a proper ending."
        />

        <aside
          className="w-full rounded-2xl border border-[var(--atelier-line)] bg-[var(--atelier-bg)] p-8 sm:p-10"
          aria-label="Example form quality summary"
        >
          <p className="text-sm text-[var(--atelier-ink-muted)]">Form Quality</p>
          <div className="mt-3 flex items-end gap-2">
            <span className="font-display text-6xl tracking-tight text-[var(--atelier-accent)]">
              88
            </span>
            <span className="mb-2 text-lg text-[var(--atelier-ink-muted)]">
              / 100
            </span>
          </div>

          <ul className="mt-8 space-y-3 text-sm">
            <li className="flex gap-3 text-[var(--atelier-ink)]">
              <span className="text-[var(--atelier-accent)]" aria-hidden>
                ✓
              </span>
              Mobile friendly
            </li>
            <li className="flex gap-3 text-[var(--atelier-ink)]">
              <span className="text-[var(--atelier-accent)]" aria-hidden>
                ✓
              </span>
              Clear questions
            </li>
            <li className="flex gap-3 text-[var(--atelier-ink)]">
              <span className="text-[var(--atelier-accent)]" aria-hidden>
                ✓
              </span>
              Completion screen configured
            </li>
            <li className="flex gap-3 text-[var(--atelier-ink-soft)]">
              <span className="text-amber-700" aria-hidden>
                ⚠
              </span>
              Too many required questions
            </li>
          </ul>

          <p className="mt-8 border-t border-[var(--atelier-line)] pt-5 text-sm text-[var(--atelier-ink-muted)]">
            Estimated completion time: 3 min
          </p>
        </aside>
      </div>
    </LandingSection>
  );
}
