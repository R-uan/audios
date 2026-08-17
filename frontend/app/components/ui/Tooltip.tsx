import { ReactNode, useState } from "react";

export function Tooltip({
  content,
  children,
  className = "",
}: {
  content: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className={`relative min-w-0 ${className}`}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div className="absolute left-0 bottom-full mb-1.5 z-50 px-2 py-1 text-xs text-foreground bg-surface-2 border border-border-strong rounded-md shadow-lg shadow-black/40 break-words max-w-full w-fit">
          {content}
        </div>
      )}
    </div>
  );
}
