import { createPortal } from "react-dom";
import { Check, X } from "lucide-react";
import { useNoticeContext } from "../context/NoticeContext";
import { INotice } from "../models/INotice";

function NoticeItem({ notice }: { notice: INotice }) {
  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-lg shadow-xl shadow-black/40 border backdrop-blur-sm
        ${
          notice.success
            ? "bg-surface/95 border-border-strong"
            : "bg-surface/95 border-danger/60"
        }`}
    >
      {/* Icon */}
      <div
        className={`shrink-0 mt-0.5 ${notice.success ? "text-positive" : "text-danger"}`}
      >
        {notice.success ? (
          <Check className="w-4 h-4" />
        ) : (
          <X className="w-4 h-4" />
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col min-w-0 flex-1 gap-0.5">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-medium text-foreground truncate">
            {notice.title}
          </span>
          <span className="text-[10px] text-muted-faint shrink-0">
            {notice.source}
          </span>
        </div>
        {notice.message && (
          <span className="text-xs text-muted line-clamp-2">
            {notice.message}
          </span>
        )}
      </div>
    </div>
  );
}

export function NoticeWindow() {
  const { notices } = useNoticeContext();

  if (notices.length === 0) return null;

  return createPortal(
    <div className="fixed bottom-28 right-4 z-50 flex flex-col gap-2 w-80">
      {notices.map((notice) => (
        <NoticeItem key={notice.id} notice={notice} />
      ))}
    </div>,
    document.body,
  );
}
