import { InputHTMLAttributes, forwardRef } from "react";

export const Slider = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className = "", ...props }, ref) => (
  <input
    ref={ref}
    type="range"
    className={`h-1 appearance-none rounded-full bg-surface-3 cursor-pointer ${className}`}
    {...props}
  />
));
Slider.displayName = "Slider";
