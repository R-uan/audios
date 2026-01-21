import { MouseEvent, useCallback, useEffect, useState } from "react";
import style from "./LeftSection.module.scss";
import { usePlaylistContext } from "../context/PlaylistContext";
import { IPlaylist } from "../models/IPlaylist";
import { useContextMenu } from "./ContextMenu";
import { useQueueContext } from "../context/QueueContext";
import { Modal } from "./Modal";

export function LeftSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [audioLibraryOpen, setAudioLibraryOpen] = useState(true);
  const [playlistsOpen, setPlaylistsOpen] = useState(true);
  const [tagsOpen, setTagsOpen] = useState(false);
  const playlistContext = usePlaylistContext();
  const queueContext = useQueueContext();
  const [inputValue, setInputValue] = useState("");
  const [isChecked, setIsChecked] = useState(false);

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
  };

  // Use the custom hook
  const { handleRightClick, contextMenu, ContextMenu } =
    useContextMenu<IPlaylist>("left_section");

  return (
    <section className={style.leftSection}>
      <div>
        <h1>Library</h1>
      </div>
      <nav>
        <div className={style.section}>
          <button
            onClick={() => setAudioLibraryOpen(!audioLibraryOpen)}
            className={style.menuHeader}
          >
            <span className={style.menuTitle}>Archive</span>
            <span
              className={`${style.arrow} ${audioLibraryOpen ? style.arrowOpen : ""}`}
            >
              ▶
            </span>
          </button>
          {audioLibraryOpen && (
            <ul className={style.mainList}>
              <li className={style.listItem}>
                <button
                  onClick={() => playlistContext.setCurrentPlaylist(null)}
                >
                  All audios
                </button>
              </li>
              <li className={style.nestedItem}>
                <button
                  onClick={() => setTagsOpen(!tagsOpen)}
                  className={style.nestedButton}
                >
                  <span>Tags</span>
                  <span
                    className={`${style.arrow} ${tagsOpen ? style.arrowOpen : ""}`}
                  >
                    ▶
                  </span>
                </button>
                {tagsOpen && (
                  <ul className={style.nestedList}>
                    <li className={style.tagItem}>
                      <button>Placeholder</button>
                    </li>
                  </ul>
                )}
              </li>
            </ul>
          )}
        </div>
        {/* Playlist */}
        <div className={style.section}>
          <button
            onClick={() => setPlaylistsOpen(!playlistsOpen)}
            className={style.menuHeader}
          >
            <span className={style.menuTitle}>Playlists</span>
            <span
              className={`${style.arrow} ${playlistsOpen ? style.arrowOpen : ""}`}
            >
              ▶
            </span>
          </button>
          {playlistsOpen && (
            <>
              <button
                onClick={() => setIsModalOpen(true)}
                className={style.create}
              >
                Create Playlist
              </button>
              <ul className={style.mainList}>
                {Array.from(playlistContext.playlists).map(([key, value]) => (
                  <li
                    className={style.listItem}
                    key={key}
                    onContextMenu={(e) => handleRightClick(e, value)}
                  >
                    <button
                      onClick={() => playlistContext.setCurrentPlaylist(key)}
                    >
                      {value.name}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* Render the context menu */}
          <ContextMenu>
            <button
              onClick={() => {
                // Access the clicked playlist via contextMenu.data
                console.log("Play now:", contextMenu?.data);
              }}
            >
              Play now
            </button>
            <button
              onClick={() => {
                if (contextMenu) {
                  queueContext.queuePlaylist(contextMenu.data);
                }
              }}
            >
              Add to queue
            </button>
            <hr className="m-4" />
            <button
              onClick={() => {
                if (contextMenu) deletePlaylist(contextMenu.data.id);
              }}
              className="text-red-400"
            >
              Delete Playlist
            </button>
          </ContextMenu>
        </div>
      </nav>

      {/* Create Playlist Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="space-y-3">
          {/* Input Field */}
          <div>
            <input
              id="item-input"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter playlist name..."
              className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
              style={{
                backgroundColor: "#2a2533",
                borderColor: "#3d3646",
                color: "#f9e5de",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#A855F7")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#3d3646")}
            />
          </div>

          {/* Checkbox */}
          <div className="flex items-center gap-2">
            <input
              id="agreement-checkbox"
              type="checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="w-5 h-5 rounded cursor-pointer"
              style={{
                accentColor: "#A855F7",
              }}
            />
            <label
              htmlFor="agreement-checkbox"
              className="text-sm cursor-pointer select-none"
              style={{ color: "#d1c4be" }}
            >
              Add queue audios to the playlist
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2 rounded transition-colors"
              style={{ backgroundColor: "#2a2533", color: "#f9e5de" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#332d3f")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#2a2533")
              }
            >
              Cancel
            </button>
            <button
              onClick={createEmptyPlaylist}
              disabled={!inputValue}
              className="flex-1 px-4 py-2 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#A855F7" }}
              onMouseEnter={(e) =>
                !e.currentTarget.disabled &&
                (e.currentTarget.style.backgroundColor = "#9333ea")
              }
              onMouseLeave={(e) =>
                !e.currentTarget.disabled &&
                (e.currentTarget.style.backgroundColor = "#A855F7")
              }
            >
              Submit
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
