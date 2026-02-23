import { useEffect, useState } from "react";
import { usePlaylistContext } from "../context/PlaylistContext";
import { IPlaylist } from "../models/IPlaylist";
import { useContextMenu } from "./ContextMenu";
import { useQueueContext } from "../context/QueueContext";
import { Modal } from "./Modal";
import { AudioFilter } from "./AudioFilter";

export function LeftSection() {
  const [tags, setTags] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [audioLibraryOpen, setAudioLibraryOpen] = useState(true);
  const [playlistsOpen, setPlaylistsOpen] = useState(true);
  const [tagsOpen, setTagsOpen] = useState(false);
  const playlistContext = usePlaylistContext();
  const queueContext = useQueueContext();
  const [inputValue, setInputValue] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  // Use the custom hook
  const { handleRightClick, contextMenu, ContextMenu, closeContextMenu } =
    useContextMenu<IPlaylist>("left_section");

  const playNow = () => {
    if (contextMenu) {
      queueContext.clearQueue();
      queueContext.queuePlaylist(contextMenu?.data);
    }
    closeContextMenu();
  };

  const createEmptyPlaylist = async () => {
    const data: { name: string; audios: string[] | null } = {
      name: inputValue,
      audios: null,
    };

    if (isChecked) data.audios = queueContext.queue.map((a) => a.id);
    const request = await fetch("http://localhost:5123/api/playlist", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (request.ok) {
      const response: IPlaylist = await request.json();
      playlistContext.addPlaylist(response);
    }

    setInputValue("");
    setIsChecked(false);
    setIsModalOpen(false);
  };

  const deletePlaylist = async (playlistId: string) => {
    const request = await fetch(
      `http://localhost:5123/api/playlist/${playlistId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (request.ok) {
      const response: { deleted: string } = await request.json();
      playlistContext.removePlaylist(response.deleted);
    }

    closeContextMenu();
  };

  useEffect(() => {
    async function fetchTags() {
      try {
        const response = await fetch("http://localhost:5123/api/audio/tags");
        if (!response.ok) {
          console.log("Could not fetch audio data");
          return;
        }
        const result: string[] = await response.json();
        setTags(result);
      } catch (e) {
        console.log(e);
      }
    }

    fetchTags();
  }, []);

  return (
    <section className="flex flex-col w-60 shrink-0 bg-zinc-900 border-r border-zinc-800 overflow-y-auto">
      {/* Library Header */}
      <div className="px-4 py-3 h-12 flex items-center border-b border-zinc-800">
        <h1 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Library
        </h1>
      </div>

      <nav className="flex flex-col gap-1 p-2">
        {/* Archive Section */}
        <div>
          <button
            onClick={() => setAudioLibraryOpen(!audioLibraryOpen)}
            className="w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <span>Archive</span>
            <svg
              className={`w-3 h-3 transition-transform duration-200 ${audioLibraryOpen ? "rotate-90" : ""}`}
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

          {audioLibraryOpen && (
            <ul className="mt-0.5 ml-2 border-l border-zinc-800 pl-2 flex flex-col gap-0.5">
              <li>
                <button
                  onClick={() => playlistContext.setCurrentPlaylist(null)}
                  className="w-full text-left px-2 py-1.5 rounded-md text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
                >
                  All audios
                </button>
              </li>
              <li>
                <button
                  onClick={() => setTagsOpen(!tagsOpen)}
                  className="w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
                >
                  <span>Tags</span>
                  <svg
                    className={`w-3 h-3 transition-transform duration-200 ${tagsOpen ? "rotate-90" : ""}`}
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
                {tagsOpen && (
                  <ul className="mt-0.5 ml-2 border-l border-zinc-800 pl-2 flex flex-col gap-0.5">
                    {tags.map((t) => {
                      return (
                        <li>
                          <button className="w-full text-left px-2 py-1.5 rounded-md text-sm text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-colors">
                            {t}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            </ul>
          )}
        </div>

        <div className="my-1 border-t border-zinc-800" />

        {/* Playlists Section */}
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
                  <li
                    key={key}
                    onContextMenu={(e) => handleRightClick(e, value)}
                  >
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
              onClick={() => playNow()}
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
            <hr className="my-1 border-zinc-700/60" />
            <button
              onClick={() => {
                if (contextMenu) deletePlaylist(contextMenu.data.id);
              }}
              className="w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-zinc-800 transition-colors"
            >
              Delete Playlist
            </button>
          </ContextMenu>
        </div>
        <div className="my-1 border-t border-zinc-800" />

        <div>
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <span>Filters</span>
            <svg
              className={`w-3 h-3 transition-transform duration-200 ${filtersOpen ? "rotate-90" : ""}`}
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
          {filtersOpen && (
            <div className="mt-1 px-1">
              <AudioFilter />
            </div>
          )}
        </div>
      </nav>

      {/* Create Playlist Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="space-y-3">
          <input
            id="item-input"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter playlist name..."
            className="w-full px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />

          <div className="flex items-center gap-2">
            <input
              id="agreement-checkbox"
              type="checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="w-4 h-4 rounded accent-purple-500 cursor-pointer"
            />
            <label
              htmlFor="agreement-checkbox"
              className="text-sm text-zinc-400 cursor-pointer select-none"
            >
              Add queue audios to the playlist
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2 text-sm rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={createEmptyPlaylist}
              disabled={!inputValue}
              className="flex-1 px-4 py-2 text-sm rounded-lg bg-purple-600 text-white hover:bg-purple-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Submit
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
