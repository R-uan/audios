import { useState } from "react";
import { AudioWrapper } from "./AudioWrapper";
import { UpdateAudioForm } from "./form/UpdateAudioModal";
import { AudioCatalogHeader } from "./AudioCatalogHeader";
import { useAudioCatalog } from "../hooks/useAudioCatalog";
import { IAudio } from "../models/IAudio";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { MenuItem, MenuItemLink, MenuSeparator } from "./ui/Menu";
import { EmptyState } from "./ui/EmptyState";

export function AudioCatalog() {
  const {
    currentPlaylist,
    audiosToRender,
    fetching,
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
    handleSeeMoreOfArtist,
    queueRenderedAudios,
    playAudio,
    queueAudio,
  } = useAudioCatalog();

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [audioToDelete, setAudioToDelete] = useState<IAudio | null>(null);

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-background">
      <AudioCatalogHeader
        currentPlaylist={currentPlaylist}
        audiosToRender={audiosToRender}
        onQueueAll={queueRenderedAudios}
      />
      <div className="flex-1 overflow-y-auto">
        {fetching ? (
          <ul className="p-3 flex flex-col gap-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <li
                key={i}
                className="flex items-center gap-3 px-3 py-2 animate-pulse"
              >
                <div className="w-10 h-10 rounded-md bg-surface-2" />
                <div className="flex flex-col gap-1.5 flex-1">
                  <div className="h-3 w-2/5 rounded bg-surface-2" />
                  <div className="h-2.5 w-1/4 rounded bg-surface-2" />
                </div>
                <div className="h-2.5 w-10 rounded bg-surface-2" />
              </li>
            ))}
          </ul>
        ) : audiosToRender == null ? (
          <EmptyState message="This playlist is empty" />
        ) : audiosToRender.length === 0 ? (
          <EmptyState message="No audio found" />
        ) : (
          <ul className="p-3 flex flex-col gap-0.5">
            {audiosToRender.map((audio) => (
              <AudioWrapper
                key={audio.id}
                audio={audio}
                onPlay={playAudio}
                onQueue={queueAudio}
                onContextMenuHandler={handleRightClick}
              />
            ))}
          </ul>
        )}
        <ContextMenu>
          <MenuItem onClick={handlePlayAudio}>Play now</MenuItem>
          <MenuItem onClick={handleQueueAudio}>Add to queue</MenuItem>
          <MenuItemLink
            href={contextMenu?.data?.link}
            onClick={() => closeContextMenu()}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open Link
          </MenuItemLink>
          <MenuItem onClick={handleSeeMoreOfArtist}>
            See more about {contextMenu?.data.artist}
          </MenuItem>
          <MenuSeparator />
          <MenuItem onClick={handleEditAudio}>Edit</MenuItem>
          <MenuItem
            tone="danger"
            onClick={() => {
              setAudioToDelete(contextMenu?.data ?? null);
              setConfirmDelete(true);
            }}
          >
            Delete
          </MenuItem>
        </ContextMenu>
      </div>

      <Modal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        ariaLabel="Delete audio"
      >
        <p className="text-sm text-foreground mb-1 font-medium">
          Delete audio?
        </p>
        <p className="text-xs text-muted mb-4">
          This action cannot be undone.
        </p>
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={async () => {
              if (audioToDelete) await handleDeleteAudio(audioToDelete.id);
              setConfirmDelete(false);
              setAudioToDelete(null);
            }}
          >
            Delete
          </Button>
        </div>
      </Modal>

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
