import { cn } from "../../lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[10px] font-medium transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] disabled:pointer-events-none disabled:opacity-45",
        size === "sm" && "h-9 px-3.5 text-sm",
        size === "md" && "h-11 px-5 text-[15px]",
        size === "lg" && "h-12 px-7 text-base",
        variant === "primary" &&
          "bg-[var(--atelier-accent)] text-white hover:bg-[var(--atelier-accent-hover)] active:scale-[0.98]",
        variant === "secondary" &&
          "bg-white text-[var(--atelier-ink)] shadow-[inset_0_0_0_1px_var(--atelier-line)] hover:shadow-[inset_0_0_0_1px_var(--atelier-line-strong)]",
        variant === "ghost" &&
          "bg-transparent text-[var(--atelier-ink-soft)] hover:bg-black/[0.04] hover:text-[var(--atelier-ink)]",
        variant === "danger" &&
          "bg-[var(--atelier-danger)] text-white hover:opacity-90",
        className,
      )}
      {...props}
    />
  );
}
