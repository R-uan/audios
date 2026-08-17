import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function DropdownPortal<T extends HTMLElement>({
  anchorRef,
  children,
  height = "150px",
}: {
  anchorRef: React.RefObject<T | null>;
  children: ReactNode;
  height?: string;
}) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (anchorRef.current) setRect(anchorRef.current.getBoundingClientRect());
  }, [anchorRef]);

  if (!rect) return null;

  return createPortal(
    <ul
      style={{
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        height,
      }}
      className="fixed z-50 bg-surface border border-border-strong rounded-md shadow-xl shadow-black/40 overflow-y-auto"
    >
      {children}
    </ul>,
    document.body,
  );
}
