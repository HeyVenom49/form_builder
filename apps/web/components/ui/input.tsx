import { cn } from "../../lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-[10px] border-0 bg-white px-4 text-[15px] text-[var(--atelier-ink)] shadow-[inset_0_0_0_1px_var(--atelier-line)] transition-shadow placeholder:text-[var(--atelier-ink-muted)] hover:shadow-[inset_0_0_0_1px_var(--atelier-line-strong)] focus:shadow-[inset_0_0_0_1.5px_var(--atelier-accent)] focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full resize-y rounded-[10px] border-0 bg-white px-4 py-3 text-[15px] text-[var(--atelier-ink)] shadow-[inset_0_0_0_1px_var(--atelier-line)] transition-shadow placeholder:text-[var(--atelier-ink-muted)] hover:shadow-[inset_0_0_0_1px_var(--atelier-line-strong)] focus:shadow-[inset_0_0_0_1.5px_var(--atelier-accent)] focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}
