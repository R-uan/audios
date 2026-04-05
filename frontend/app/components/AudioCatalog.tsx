import { AudioWrapper } from "./AudioWrapper";
import { UpdateAudioForm } from "./form/UpdateAudioModal";
import { AudioCatalogHeader } from "./AudioCatalogHeader";
import { useAudioCatalog } from "../hooks/useAudioCatalog";
import { useState } from "react";
import { IAudio } from "../models/IAudio";

export function AudioCatalog() {
  const {
    currentPlaylist,
    audiosToRender,
    editingAudio,
    setEditingAudio,
    contextMenu,
    ContextMenu,
    handleRightClick,
    closeContextMenu,
    handlePlayAudio,
    handleQueueAudio,
    handleEditAudio,
    handleUpdateAudio,
    handleDeleteAudio,
    queueRenderedAudios,
  } = useAudioCatalog();

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [audioToDelete, setAudioToDelete] = useState<IAudio | null>(null);

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-zinc-950">
      <AudioCatalogHeader
        currentPlaylist={currentPlaylist}
        audiosToRender={audiosToRender}
        onQueueAll={queueRenderedAudios}
      />
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
          <a
            href={contextMenu?.data?.link}
            onClick={() => closeContextMenu()}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-left px-3 py-2 text-sm text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            Open Link
          </a>
          <button
            onClick={() => contextMenu?.data.artist}
            className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            See more about {contextMenu?.data.artist}
          </button>
          <hr className="my-1 mx-3 border-zinc-700/40" />
          <button
            onClick={handleEditAudio}
            className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => {
              setAudioToDelete(contextMenu?.data ?? null);
              setConfirmDelete(true);
            }}
            className="w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-zinc-800 transition-colors"
          >
            Delete
          </button>
        </ContextMenu>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-5 w-72 shadow-xl">
            <p className="text-sm text-zinc-200 mb-1 font-medium">
              Delete audio?
            </p>
            <p className="text-xs text-zinc-500 mb-4">
              This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-1.5 text-xs rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (audioToDelete) await handleDeleteAudio(audioToDelete.id);
                  setConfirmDelete(false);
                  setAudioToDelete(null);
                }}
                className="px-3 py-1.5 text-xs rounded-md bg-red-600 hover:bg-red-500 text-white transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {editingAudio !== null && (
        <UpdateAudioForm
          audio={editingAudio}
          onClose={() => setEditingAudio(null)}
          onSave={handleUpdateAudio}
        />
      )}
    </div>
  );
}
