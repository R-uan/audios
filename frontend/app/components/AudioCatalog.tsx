import { useAudioContext } from "../context/AudioContext";
import { useQueueContext } from "../context/QueueContext";
import { IAudio, IUpdateAudio } from "../models/IAudio";
import { AudioWrapper } from "./AudioWrapper";
import { usePlaylistContext } from "../context/PlaylistContext";
import { useContextMenu } from "./ContextMenu";
import { EditAudioModal } from "./EditAudioModal";
import { useState } from "react";
import { AudioRequest } from "../shared/AudioRequests";

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

  const handlePlayNow = () => {
    if (contextMenu?.data) queueContext.playNow(contextMenu.data);
    closeContextMenu();
  };

  const handleEdit = () => {
    if (contextMenu?.data) setEditingAudio(contextMenu.data);
    closeContextMenu();
  };

  const handleSave = async (audio: IAudio, add: string[], remove: string[]) => {
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

    await AudioRequest.UpdateAudio(audio.id, update);
    setEditingAudio(null);
  };

  const currentPlaylist = playlistContext.currentPlaylist;
  const audiosToRender =
    currentPlaylist == null
      ? audioContext.audios
      : currentPlaylist.audios != null
        ? (currentPlaylist.audios
            .map((id) => audioContext.audios.find((a) => a.id === id))
            .filter(Boolean) as IAudio[])
        : null;

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-zinc-950">
      {/* Header */}
      <header className="flex items-center justify-between h-12 px-6 py-3 border-b border-zinc-800 shrink-0">
        <span className="text-sm font-semibold text-zinc-100">
          {currentPlaylist ? currentPlaylist.name : "All Audios"}
        </span>
        {audiosToRender && (
          <span className="text-xs text-zinc-600 tabular-nums">
            {audiosToRender.length} tracks
          </span>
        )}
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
            onClick={handlePlayNow}
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
          <button
            onClick={handleEdit}
            className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            Edit
          </button>
        </ContextMenu>
      </div>

      {/* Edit Modal */}
      {editingAudio !== null && (
        <EditAudioModal
          audio={editingAudio}
          onClose={() => setEditingAudio(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
