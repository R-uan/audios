import { AnchorHTMLAttributes, ButtonHTMLAttributes, forwardRef } from "react";

const baseCls =
  "block w-full text-left px-3 py-2 text-sm text-foreground-soft hover:text-foreground hover:bg-surface-2 transition-colors";

export interface MenuItemProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: "default" | "danger";
}

export const MenuItem = forwardRef<HTMLButtonElement, MenuItemProps>(
  ({ tone = "default", className = "", ...props }, ref) => (
    <button
      ref={ref}
      role="menuitem"
      className={`${baseCls} focus-visible:outline-none focus-visible:bg-surface-2 ${
        tone === "danger" ? "text-danger hover:text-danger" : ""
      } ${className}`}
      {...props}
    />
  ),
);
MenuItem.displayName = "MenuItem";

export const MenuItemLink = forwardRef<
  HTMLAnchorElement,
  AnchorHTMLAttributes<HTMLAnchorElement>
>(({ className = "", ...props }, ref) => (
  <a
    ref={ref}
    role="menuitem"
    className={`${baseCls} focus-visible:outline-none focus-visible:bg-surface-2 ${className}`}
    {...props}
  />
));
MenuItemLink.displayName = "MenuItemLink";

export const MenuSeparator = () => <hr className="my-1 mx-3 border-border" />;
