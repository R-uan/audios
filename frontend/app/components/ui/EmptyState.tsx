import { ReactNode } from "react";

export function EmptyState({
  icon,
  message,
}: {
  icon?: ReactNode;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-faint">
      {icon}
      <span className="text-xs">{message}</span>
    </div>
  );
}
