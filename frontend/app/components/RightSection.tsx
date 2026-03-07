import { useQueueContext } from "../context/QueueContext";
import { useState } from "react";
import { IAudio } from "../models/IAudio";
import { useContextMenu } from "./ContextMenu";
import { useFilters } from "../context/AudioFilterContext";

function TitleTooltip({
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
        <div className="absolute left-0 bottom-full mb-1.5 z-50 px-2 py-1 text-xs text-zinc-100 bg-zinc-800 border border-zinc-700 rounded shadow-lg shadow-black/40 whitespace-nowrap max-w-xs">
          {title}
        </div>
      )}
    </div>
  );
}

function TagsRow({ tags }: { tags: string[] }) {
  const [visible, setVisible] = useState(false);
  const tagJoin = tags.join(" · ");
  return (
    <div
      className="relative min-w-0"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <span className={`block truncate text-xs `}>
        {tagJoin.length <= 37 ? tagJoin : `${tagJoin.slice(0, 35)}…`}
      </span>
      {visible && (
        <div className="absolute left-0 bottom-full mb-1.5 z-50 px-2 text-xs py-1.5 text-zinc-100 bg-zinc-800 border border-zinc-700 rounded shadow-lg shadow-black/40 flex flex-wrap gap-1.5 max-w-xs">
          {tags.map((tag) => (
            <span key={tag} className="text-zinc-100">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function RightSection() {
  const queueContext = useQueueContext();
  const { set } = useFilters();

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const { handleRightClick, contextMenu, ContextMenu, closeContextMenu } =
    useContextMenu<IAudio>("right_section");

  const currentAndUpcoming = queueContext.queue.slice(
    queueContext.queuePointer,
  );
  const currentSong = currentAndUpcoming[0];
  const upcomingSongs = currentAndUpcoming.slice(1);

  function handleDragStart(index: number) {
    setDraggedIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    setDragOverIndex(index);
  }

  function handleDragLeave() {
    setDragOverIndex(null);
  }

  function handleDrop(e: React.DragEvent, dropIndex: number) {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    const actualDraggedIndex = queueContext.queuePointer + 1 + draggedIndex;
    const actualDropIndex = queueContext.queuePointer + 1 + dropIndex;
    const newQueue = [...queueContext.queue];
    const [removed] = newQueue.splice(actualDraggedIndex, 1);
    newQueue.splice(actualDropIndex, 0, removed);
    queueContext.setQueue(newQueue);
    setDraggedIndex(null);
    setDragOverIndex(null);
  }

  function handleDragEnd() {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }

  function playNow() {
    if (contextMenu) queueContext.playNow(contextMenu.data);
    closeContextMenu();
  }

  function removeFromQueue() {
    if (contextMenu) {
      queueContext.setQueue(
        queueContext.queue.filter((a) => a.id !== contextMenu.data.id),
      );
    }
    closeContextMenu();
  }

  function seeMoreOfArtist() {
    if (contextMenu) set("artist", contextMenu.data.artist);
    closeContextMenu();
  }

  return (
    <section
      style={{ width: "351px" }}
      className="flex flex-col overflow-hidden bg-zinc-900 border-l border-zinc-800"
    >
      {/* Header */}
      <header className="flex h-12 items-center justify-between px-4 py-3 border-b border-zinc-800 shrink-0">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Queue
        </h3>
        <div className="flex items-center gap-1">
          <button
            className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            onClick={queueContext.shuffleQueue}
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
          <button
            onClick={queueContext.clearQueue}
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
          <div className="p-2 flex flex-col gap-3">
            {/* Now Playing */}
            {currentSong && (
              <div>
                <h4 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 px-3 mb-1.5">
                  Now Playing
                </h4>
                <div
                  className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700"
                  onContextMenu={(e) => handleRightClick(e, currentSong)}
                >
                  <svg
                    className="w-4 h-4 text-green-500 shrink-0 mt-0.5 animate-pulse"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <div className="flex flex-col min-w-0 flex-1 gap-0.5">
                    <TitleTooltip title={currentSong.title}>
                      <span className="text-sm font-medium text-zinc-100 truncate leading-snug block">
                        {currentSong.title.length <= 37
                          ? currentSong.title
                          : `${currentSong.title.slice(0, 35)}…`}
                      </span>
                    </TitleTooltip>
                    {currentSong.metadata.tags.length > 0 && (
                      <TagsRow tags={currentSong.metadata.tags} />
                    )}
                    <span className="text-xs text-zinc-400 truncate">
                      {currentSong.artist}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Up Next */}
            {upcomingSongs.length > 0 && (
              <div>
                <h4 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 px-3 mb-1.5">
                  Up Next ({upcomingSongs.length})
                </h4>
                <ul className="flex flex-col gap-0.5">
                  {upcomingSongs.map((audio, index) => (
                    <li
                      key={`queue.${audio.id}.${queueContext.queuePointer + index + 1}`}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                      onContextMenu={(e) => handleRightClick(e, audio)}
                      className={`
                        group flex items-start gap-2 px-3 py-2 rounded-lg
                        hover:bg-zinc-800 transition-all cursor-grab active:cursor-grabbing
                        ${draggedIndex === index ? "opacity-40 scale-95" : ""}
                        ${dragOverIndex === index && draggedIndex !== index ? "border-2 border-zinc-600 bg-zinc-800/50" : ""}
                      `}
                    >
                      <svg
                        className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 shrink-0 mt-0.5 transition-colors"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M9 3h2v2H9V3zm0 4h2v2H9V7zm0 4h2v2H9v-2zm0 4h2v2H9v-2zm0 4h2v2H9v-2zm4-16h2v2h-2V3zm0 4h2v2h-2V7zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2z" />
                      </svg>

                      <div className="flex flex-col min-w-0 flex-1 gap-0.5">
                        <TitleTooltip title={audio.title}>
                          <span className="text-sm text-zinc-200 truncate leading-snug block">
                            {audio.title.length <= 37
                              ? audio.title
                              : `${audio.title.slice(0, 35)}…`}
                          </span>
                        </TitleTooltip>
                        {audio.metadata.tags.length > 0 && (
                          <TagsRow tags={audio.metadata.tags} />
                        )}
                        <span className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors truncate">
                          {audio.artist}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Context Menu */}
      <ContextMenu>
        <button
          onClick={playNow}
          className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
        >
          Play now
        </button>
        <button
          onClick={removeFromQueue}
          className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
        >
          Remove from queue
        </button>
        <hr className="my-1 border-zinc-700/60" />
        <button
          onClick={seeMoreOfArtist}
          className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
        >
          See more of {contextMenu?.data.artist}
        </button>
      </ContextMenu>
    </section>
  );
}
