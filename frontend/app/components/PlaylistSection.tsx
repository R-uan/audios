import { Modal } from "./Modal";
import { useState } from "react";
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
        className="w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
      >
        <span>Playlists</span>
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${playlistsOpen ? "rotate-90" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {playlistsOpen && (
        <>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full flex items-center gap-1.5 px-2 py-1.5 mt-0.5 rounded-md text-sm text-purple-400 hover:text-purple-300 hover:bg-zinc-800 transition-colors"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create Playlist
          </button>

          <ul className="mt-0.5 ml-2 border-l border-zinc-800 pl-2 flex flex-col gap-0.5">
            {Array.from(playlistContext.playlists).map(([key, value]) => (
              <li key={key} onContextMenu={(e) => handleRightClick(e, value)}>
                <button
                  onClick={() => playlistContext.setCurrentPlaylist(key)}
                  className="w-full text-left px-2 py-1.5 rounded-md text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors truncate"
                >
                  {value.name}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <ContextMenu>
        <button
          onClick={playPlaylist}
          className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
        >
          Play now
        </button>
        <button
          onClick={() => {
            if (contextMenu) queueContext.queuePlaylist(contextMenu.data);
            closeContextMenu();
          }}
          className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
        >
          Add to queue
        </button>

        <hr className="my-1 mx-3 border-zinc-700/40" />

        <button
          onClick={() => {
            if (contextMenu) deletePlaylist(contextMenu.data.id);
          }}
          className="w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-zinc-800 transition-colors"
        >
          Delete Playlist
        </button>
      </ContextMenu>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="flex flex-col gap-2 space-y-1 pb-1">
          <h2 className="text-sm font-semibold text-zinc-100">
            Create Playlist
          </h2>
          <hr className="border-zinc-800 my-4" />
          <CreatePlaylistForm onClose={() => setIsModalOpen(false)} />
        </div>
      </Modal>
    </div>
  );
}
