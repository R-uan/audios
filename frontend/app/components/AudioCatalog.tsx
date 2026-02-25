import { AudioWrapper } from "./AudioWrapper";
import { UpdateAudioForm } from "./form/UpdateAudioModal";
import { AudioCatalogHeader } from "./AudioCatalogHeader";
import { useAudioCatalog } from "../hooks/useAudioCatalog";

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

          <hr className="my-1 border-zinc-700/60" />

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
            onClick={handleEditAudio}
            className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={handleDeleteAudio}
            className="w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-zinc-800 transition-colors"
          >
            Delete
          </button>
        </ContextMenu>
      </div>

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
