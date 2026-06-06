import { useState } from "react";

export function TitleTooltip({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div
      className="relative min-w-0 flex-1"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div className="absolute left-0 bottom-full mb-1.5 z-50 px-2 py-1 text-xs text-zinc-100 bg-zinc-800 border border-zinc-700 rounded shadow-lg shadow-black/40 break-words max-w-full w-fit">
          {title}
        </div>
      )}
    </div>
  );
}