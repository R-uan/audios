import { ButtonHTMLAttributes, forwardRef } from "react";

export interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  size?: "sm" | "md";
  active?: boolean;
  tone?: "default" | "danger";
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    { label, size = "sm", active = false, tone = "default", className = "", ...props },
    ref,
  ) => (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40 disabled:pointer-events-none ${
        size === "sm" ? "p-1.5" : "p-2"
      } ${
        tone === "danger"
          ? "text-muted hover:text-danger hover:bg-surface-2"
          : active
            ? "text-accent bg-surface-2"
            : "text-muted hover:text-foreground hover:bg-surface-2"
      } ${className}`}
      {...props}
    />
  ),
);
IconButton.displayName = "IconButton";
