import { useQueueContext } from "../context/QueueContext";

export function RightSection() {
  const queueContext = useQueueContext();

  return (
    <section className="flex flex-col w-72 shrink-0 bg-zinc-900 border-l border-zinc-800">
      {/* Header */}
      <header className="flex h-12 items-center justify-between px-4 py-3 border-b border-zinc-800 shrink-0">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Queue
        </h3>
        <div className="flex items-center gap-1">
          {/* Shuffle */}
          <button
            className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            title="Shuffle"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 3h5v5M4 20L21 3M16 21h5v-5M4 4l5 5"
              />
            </svg>
          </button>
          {/* Clear */}
          <button
            className="p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
            title="Clear queue"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Queue List */}
      <div className="flex-1 overflow-y-auto">
        {queueContext.queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-zinc-600">
            <svg
              className="w-8 h-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
            <span className="text-xs">Queue is empty</span>
          </div>
        ) : (
          <ul className="p-2 flex flex-col gap-0.5">
            {queueContext.queue.map((audio, index) => (
              <li
                key={`queue.${audio.id}${index}`}
                className="group flex flex-col px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors cursor-default"
              >
                <span className="text-sm text-zinc-200 truncate leading-snug">
                  {audio.title.length <= 45
                    ? audio.title
                    : `${audio.title.slice(0, 43)}…`}
                </span>
                <span className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors truncate mt-0.5">
                  {audio.artist}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
