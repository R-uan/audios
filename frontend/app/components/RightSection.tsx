import { useMemo, useState } from "react";
import { GripVertical, Play, Shuffle, Trash2 } from "lucide-react";
import { useQueueContext } from "../context/QueueContext";
import { IAudio, IUpdateAudio } from "../models/IAudio";
import { useContextMenu } from "./ContextMenu";
import { useFilterContext } from "../context/AudioFilterContext";
import { UpdateAudioForm } from "./form/UpdateAudioModal";
import { useAudioContext } from "../context/AudioContext";
import { Tooltip } from "./ui/Tooltip";
import { MenuItem, MenuSeparator } from "./ui/Menu";
import { EmptyState } from "./ui/EmptyState";
import { IconButton } from "./ui/IconButton";
import { Artwork } from "./ui/Artwork";

function TagsRow({ tags }: { tags: string[] }) {
  const tagJoin = tags.join(" · ");
  return (
    <Tooltip
      className="flex-1"
      content={
        <div className="flex flex-wrap gap-1.5 max-w-xs">
          {tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      }
    >
      <span className="block truncate text-xs text-muted">
        {tagJoin.length <= 37 ? tagJoin : `${tagJoin.slice(0, 35)}…`}
      </span>
    </Tooltip>
  );
}

export function RightSection() {
  const queueContext = useQueueContext();
  const { set } = useFilterContext();
  const audioContext = useAudioContext();

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [editingAudio, setEditingAudio] = useState<IAudio | null>(null);

  const { handleRightClick, contextMenu, ContextMenu, closeContextMenu } =
    useContextMenu<IAudio>("right_section");

  async function handleUpdateAudio(
    audio: IAudio,
    add: string[],
    remove: string[],
  ) {
    const update: IUpdateAudio = {
      title: audio.title,
      duration: audio.metadata.duration,
      artist: audio.artist,
      genre: audio.metadata.genre,
      link: audio.link,
      mood: audio.metadata.mood,
      releaseYear: audio.metadata.releaseYear,
      source: audio.source,
      addTags: add,
      removeTags: remove,
    };

    const updatedAudio = await audioContext.updateAudio(audio.id, update);
    if (updatedAudio) queueContext.syncQueue(updatedAudio);
    setEditingAudio(null);
  }

  function handleEditAudio() {
    if (contextMenu?.data) setEditingAudio(contextMenu.data);
    closeContextMenu();
  }

  const currentAndUpcoming = useMemo(
    () => queueContext.queue.slice(queueContext.queuePointer),
    [queueContext.queue, queueContext.queuePointer],
  );

  const currentSong = useMemo(
    () => currentAndUpcoming[0],
    [currentAndUpcoming],
  );

  const upcomingSongs = useMemo(
    () => currentAndUpcoming.slice(1),
    [currentAndUpcoming],
  );

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
    <section className="w-[var(--width-queue)] flex flex-col overflow-hidden bg-surface border-l border-border">
      {/* Header */}
      <header className="flex h-12 items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-faint">
          Queue
        </h3>
        <div className="flex items-center gap-1">
          <IconButton label="Shuffle" onClick={queueContext.shuffleQueue}>
            <Shuffle className="w-3.5 h-3.5" />
          </IconButton>
          <IconButton label="Clear queue" tone="danger" onClick={queueContext.clearQueue}>
            <Trash2 className="w-3.5 h-3.5" />
          </IconButton>
        </div>
      </header>

      {/* Queue List */}
      <div className="flex-1 overflow-y-auto">
        {queueContext.queue.length === 0 ? (
          <EmptyState
            icon={<Play className="w-8 h-8" />}
            message="Queue is empty"
          />
        ) : (
          <div className="p-2 flex flex-col gap-3">
            {/* Now Playing */}
            {currentSong && (
              <div>
                <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted px-3 mb-1.5">
                  Now Playing
                </h4>
                <div
                  className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-surface-2 border border-border-strong"
                  onContextMenu={(e) => handleRightClick(e, currentSong)}
                >
                  <div className="relative shrink-0">
                    <Artwork seed={currentSong.title} size={36} alt={currentSong.title} />
                    <div className="absolute inset-0 rounded-md bg-black/40 flex items-center justify-center">
                      <Play
                        className="w-3 h-3 text-positive"
                        fill="currentColor"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col min-w-0 flex-1 gap-0.5">
                    <Tooltip content={currentSong.title} className="flex-1">
                      <span className="block text-sm font-medium text-foreground truncate leading-snug">
                        {currentSong.title.length <= 37
                          ? currentSong.title
                          : `${currentSong.title.slice(0, 35)}…`}
                      </span>
                    </Tooltip>
                    {currentSong.metadata.tags.length > 0 && (
                      <TagsRow tags={currentSong.metadata.tags} />
                    )}
                    <span className="text-xs text-muted truncate">
                      {currentSong.artist}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Up Next */}
            {upcomingSongs.length > 0 && (
              <div>
                <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted px-3 mb-1.5">
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
                        hover:bg-surface-2 transition-all cursor-grab active:cursor-grabbing
                        ${draggedIndex === index ? "opacity-40 scale-95" : ""}
                        ${dragOverIndex === index && draggedIndex !== index ? "border-2 border-border-strong bg-surface-2/50" : ""}
                      `}
                    >
                      <GripVertical className="w-3.5 h-3.5 text-muted-faint group-hover:text-muted shrink-0 mt-0.5 transition-colors" />
                      <Artwork seed={audio.title} size={32} alt={audio.title} />

                      <div className="flex flex-col min-w-0 flex-1 gap-0.5">
                        <Tooltip content={audio.title} className="flex-1">
                          <span className="block text-sm text-foreground-soft truncate leading-snug">
                            {audio.title.length <= 37
                              ? audio.title
                              : `${audio.title.slice(0, 35)}…`}
                          </span>
                        </Tooltip>
                        {audio.metadata.tags.length > 0 && (
                          <TagsRow tags={audio.metadata.tags} />
                        )}
                        <span className="text-xs text-muted group-hover:text-foreground-soft transition-colors truncate">
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
        <MenuItem onClick={playNow}>Play now</MenuItem>
        <MenuItem onClick={removeFromQueue}>Remove from queue</MenuItem>

        <MenuSeparator />

        <MenuItem onClick={handleEditAudio}>Edit Audio</MenuItem>
        <MenuItem onClick={seeMoreOfArtist}>
          See more of {contextMenu?.data.artist}
        </MenuItem>
      </ContextMenu>

      {editingAudio !== null && (
        <UpdateAudioForm
          audio={editingAudio}
          onClose={() => setEditingAudio(null)}
          onSave={handleUpdateAudio}
        />
      )}
    </section>
  );
}
