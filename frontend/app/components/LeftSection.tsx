import { MouseEvent, useCallback, useEffect, useState } from "react";
import style from "./LeftSection.module.scss";
import { usePlaylistContext } from "../context/PlaylistContext";
import { IPlaylist } from "../models/IPlaylist";
import { useContextMenu } from "./ContextMenu";
import { useQueueContext } from "../context/QueueContext";

export function LeftSection() {
  const [audioLibraryOpen, setAudioLibraryOpen] = useState(true);
  const [playlistsOpen, setPlaylistsOpen] = useState(true);
  const [tagsOpen, setTagsOpen] = useState(false);
  const playlistContext = usePlaylistContext();
  const queueContext = useQueueContext();

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
          </ContextMenu>
        </div>
      </nav>
    </section>
  );
}
