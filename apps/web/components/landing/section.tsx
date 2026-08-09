import { cn } from "../../lib/utils";

export function LandingSection({
  id,
  tone = "default",
  className,
  children,
}: {
  id?: string;
  tone?: "default" | "soft" | "warm" | "ink";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-24 border-t border-[var(--atelier-line)]",
        tone === "default" && "bg-[var(--atelier-bg)]",
        tone === "soft" && "bg-white",
        tone === "warm" && "bg-[#f3f1ec]",
        tone === "ink" && "bg-[var(--atelier-ink)] text-white",
      )}
    >
      <div className={cn("landing-container py-20 sm:py-24", className)}>
        {children}
      </div>
    </section>
  );
}

export function LandingHeader({
  title,
  description,
  align = "left",
  className,
}: {
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl text-left",
        className,
      )}
    >
      <h2 className="font-display text-3xl tracking-tight sm:text-[2.75rem] sm:leading-[1.1]">
        {title}
      </h2>
      {description && (
        <p className="mt-5 text-lg leading-relaxed text-[var(--atelier-ink-soft)]">
          {description}
        </p>
      )}
    </div>
  );
}
