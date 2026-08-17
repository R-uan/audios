import { useState } from "react";
import { ChevronRight, Plus } from "lucide-react";
import { Modal } from "./ui/Modal";
import { MenuItem, MenuSeparator } from "./ui/Menu";
import { useContextMenu } from "./ContextMenu";
import { IPlaylist } from "../models/IPlaylist";
import { useQueueContext } from "../context/QueueContext";
import { CreatePlaylistForm } from "./form/CreatePlaylistForm";
import { usePlaylistContext } from "../context/PlaylistContext";

export function PlaylistSection() {
  const queueContext = useQueueContext();
  const playlistContext = usePlaylistContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [playlistsOpen, setPlaylistsOpen] = useState(true);
  const { handleRightClick, contextMenu, ContextMenu, closeContextMenu } =
    useContextMenu<IPlaylist>("left_section");

  function playPlaylist() {
    if (contextMenu == null) return;
    queueContext.clearQueue();
    queueContext.queuePlaylist(contextMenu.data);
    closeContextMenu();
  }

  async function deletePlaylist(playlistId: string) {
    closeContextMenu();
    await playlistContext.removePlaylist(playlistId);
  }

  return (
    <div>
      <button
        onClick={() => setPlaylistsOpen(!playlistsOpen)}
        className="w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm font-medium text-muted hover:text-foreground hover:bg-surface-2 transition-colors"
      >
        <span>Playlists</span>
        <ChevronRight
          className={`w-3 h-3 transition-transform duration-200 ${playlistsOpen ? "rotate-90" : ""}`}
        />
      </button>

      {playlistsOpen && (
        <>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full flex items-center gap-1.5 px-2 py-1.5 mt-0.5 rounded-md text-sm text-accent hover:text-accent-hover hover:bg-surface-2 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Playlist
          </button>

          <ul className="mt-0.5 ml-2 border-l border-border pl-2 flex flex-col gap-0.5">
            {Array.from(playlistContext.playlists).map(([key, value]) => (
              <li key={key} onContextMenu={(e) => handleRightClick(e, value)}>
                <button
                  onClick={() => playlistContext.setCurrentPlaylist(key)}
                  className="w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-md text-sm text-muted hover:text-foreground hover:bg-surface-2 transition-colors"
                >
                  <span className="truncate">{value.name}</span>
                  <span className="text-xs text-muted-faint tabular-nums shrink-0">
                    {value.audios.length}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <ContextMenu>
        <MenuItem onClick={playPlaylist}>Play now</MenuItem>
        <MenuItem
          onClick={() => {
            if (contextMenu) queueContext.queuePlaylist(contextMenu.data);
            closeContextMenu();
          }}
        >
          Add to queue
        </MenuItem>

        <MenuSeparator />

        <MenuItem
          tone="danger"
          onClick={() => {
            if (contextMenu) deletePlaylist(contextMenu.data.id);
          }}
        >
          Delete Playlist
        </MenuItem>
      </ContextMenu>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        ariaLabel="Create Playlist"
      >
        <div className="flex flex-col gap-2 space-y-1 pb-1">
          <h2 className="text-sm font-semibold text-foreground">
            Create Playlist
          </h2>
          <hr className="border-border my-4" />
          <CreatePlaylistForm onClose={() => setIsModalOpen(false)} />
        </div>
      </Modal>
    </div>
  );
}
