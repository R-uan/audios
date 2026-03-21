import { createPortal } from "react-dom";
import { useNoticeContext } from "../context/NoticeContext";
import { INotice } from "../models/INotice";

function NoticeItem({ notice }: { notice: INotice }) {
  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-lg shadow-xl shadow-black/40 border backdrop-blur-sm
        ${
          notice.success
            ? "bg-zinc-900/95 border-zinc-700"
            : "bg-zinc-900/95 border-red-800/60"
        }`}
    >
      {/* Icon */}
      <div
        className={`shrink-0 mt-0.5 ${notice.success ? "text-green-500" : "text-red-400"}`}
      >
        {notice.success ? (
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col min-w-0 flex-1 gap-0.5">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-medium text-zinc-100 truncate">
            {notice.title}
          </span>
          <span className="text-[10px] text-zinc-600 shrink-0">
            {notice.source}
          </span>
        </div>
        {notice.message && (
          <span className="text-xs text-zinc-400 line-clamp-2">
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
