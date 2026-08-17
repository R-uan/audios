import { InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className = "", ...props }, ref) => (
  <input
    ref={ref}
    className={`w-full px-3 py-2 text-sm rounded-md bg-surface-2 border border-border-strong text-foreground placeholder-muted-faint focus:outline-none focus:ring-1 focus:ring-accent focus:border-transparent transition-all ${className}`}
    {...props}
  />
));
Input.displayName = "Input";
