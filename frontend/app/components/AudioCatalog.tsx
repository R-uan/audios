import { useAudioContext } from "../context/AudioContext";
import { useQueueContext } from "../context/QueueContext";
import { IAudio, IUpdateAudio } from "../models/IAudio";
import { AudioWrapper } from "./AudioWrapper";
import { usePlaylistContext } from "../context/PlaylistContext";
import { useContextMenu } from "./ContextMenu";
import { EditAudioModal } from "./EditAudioModal";
import { createContext, useMemo, useState } from "react";
import { AudioRequest } from "../shared/AudioRequests";
import { useFilters } from "../context/AudioFilterContext";

export function AudioCatalog() {
  const audioContext = useAudioContext();
  const queueContext = useQueueContext();
  const playlistContext = usePlaylistContext();

  const [editingAudio, setEditingAudio] = useState<IAudio | null>(null);

  const { handleRightClick, contextMenu, ContextMenu, closeContextMenu } =
    useContextMenu<IAudio>("audio_catalog");

  const handleQueueAudio = () => {
    if (contextMenu?.data) queueContext.queueAudio(contextMenu.data);
    closeContextMenu();
  };
  const { filters } = useFilters();

  const currentPlaylist = playlistContext.currentPlaylist;

  const audiosToRender = useMemo(() => {
    let list =
      currentPlaylist == null
        ? audioContext.audios
        : currentPlaylist.audios != null
          ? (currentPlaylist.audios
              .map((id) => audioContext.audios.find((a) => a.id === id))
              .filter(Boolean) as IAudio[])
          : null;

    if (!list) return null;

    return list.filter((a) => {
      if (
        filters.name &&
        !a.title.toLowerCase().includes(filters.name.toLowerCase())
      )
        return false;
      if (
        filters.artist &&
        !a.artist.toLowerCase().includes(filters.artist.toLowerCase())
      )
        return false;
      if (
        filters.includeTags.length > 0 &&
        !filters.includeTags.every((t) => a.metadata.tags.includes(t))
      )
        return false;
      if (
        filters.excludeTags.length > 0 &&
        filters.excludeTags.some((t) => a.metadata.tags.includes(t))
      )
        return false;
      return true;
    });
  }, [audioContext.audios, currentPlaylist, filters]);

  const handlePlayAudio = () => {
    if (contextMenu?.data) queueContext.playNow(contextMenu.data);
    closeContextMenu();
  };

  const handleEditAudio = () => {
    if (contextMenu?.data) setEditingAudio(contextMenu.data);
    closeContextMenu();
  };

  const handleUpdateAudio = async (
    audio: IAudio,
    add: string[],
    remove: string[],
  ) => {
    const update: IUpdateAudio = {
      title: audio.title,
      duration: audio.metadata.duration,
      artist: audio.artist,
      genrer: audio.metadata.genrer,
      link: audio.link,
      mood: audio.metadata.mood,
      releaseYear: audio.metadata.releaseYear,
      source: audio.source,
      addTags: add,
      removeTags: remove,
    };

    const newAudio = await AudioRequest.UpdateAudio(audio.id, update);
    if (newAudio != null) audioContext.updateAudio(newAudio);
    setEditingAudio(null);
  };

  const handleDeleteAudio = async () => {
    if (contextMenu != null) {
      if (await AudioRequest.DeleteAudio(contextMenu.data.id))
        audioContext.deleteAudio(contextMenu.data.id);
    }
    closeContextMenu();
  };

  const queueRenderedAudios = () => {
    if (audiosToRender != null && audiosToRender.length > 0)
      queueContext.queueAudio(audiosToRender);
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-zinc-950">
      {/* Header */}
      <header className="flex items-center justify-between h-12 px-6 py-3 border-b border-zinc-800 shrink-0">
        <span className="text-sm font-semibold text-zinc-100">
          {currentPlaylist ? currentPlaylist.name : "All Audios"}
        </span>
        <div className="flex gap-2 items-center">
          <button
            onClick={queueRenderedAudios}
            className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 10h10M4 14h7M15 17h6M18 14v6"
              />
            </svg>
          </button>
          <span className="text-xs text-zinc-600 tabular-nums">
            {audiosToRender ? audiosToRender.length : 0} tracks
          </span>
        </div>
      </header>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {audiosToRender == null ? (
          <div className="flex items-center justify-center h-full text-sm text-zinc-600">
            This playlist is empty
          </div>
        ) : audiosToRender.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-zinc-600">
            No audio found
          </div>
        ) : (
          <ul className="p-3 flex flex-col gap-0.5">
            {audiosToRender.map((audio) => (
              <AudioWrapper
                key={audio.id}
                audio={audio}
                onContextMenuHandler={handleRightClick}
              />
            ))}
          </ul>
        )}

        <ContextMenu>
          <button
            onClick={handlePlayAudio}
            className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            Play now
          </button>
          <button
            onClick={handleQueueAudio}
            className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            Add to queue
          </button>
          <hr className="my-1 border-zinc-700/60" />
          <a
            href={contextMenu?.data.link}
            onClick={closeContextMenu}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            Open Link
          </a>

          <button
            onClick={handleEditAudio}
            className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={handleDeleteAudio}
            className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            Delete
          </button>
        </ContextMenu>
      </div>

      {/* Edit Modal */}
      {editingAudio !== null && (
        <EditAudioModal
          audio={editingAudio}
          onClose={() => setEditingAudio(null)}
          onSave={handleUpdateAudio}
        />
      )}
    </div>
  );
}
