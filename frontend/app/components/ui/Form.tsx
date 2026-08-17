import { ReactNode } from "react";

export function Field({
  label,
  children,
  className = "",
}: {
  label: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label className="block text-xs text-muted">{label}</label>
      {children}
    </div>
  );
}

export function Required() {
  return <span className="text-danger ml-0.5">*</span>;
}
