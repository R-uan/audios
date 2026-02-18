"use client";

import { useState, useRef } from "react";
import { usePlaylistContext } from "../context/PlaylistContext";
import { useQueueContext } from "../context/QueueContext";
import { useContextMenu } from "./ContextMenu";
import { Modal } from "./Modal";
import { IPlaylist } from "../models/IPlaylist";

// You can replace this with actual data from an API or context
const artistsList = [
  "The Beatles",
  "Pink Floyd",
  "Led Zeppelin",
  "Queen",
  "David Bowie",
  "Radiohead",
  "Nirvana",
  "The Rolling Stones",
  "Arctic Monkeys",
  "Tame Impala",
];

// Placeholder tags - replace with actual tags from your API/context
const tagsList = ["Rock", "Pop", "Jazz", "Classical", "Electronic"];

export function Header() {
  const [openMenu, setOpenMenu] = useState(null);
  const [showTagsSubmenu, setShowTagsSubmenu] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isChecked, setIsChecked] = useState(false);

  const timeoutRef = useRef(null);
  const tagsTimeoutRef = useRef(null);

  const playlistContext = usePlaylistContext();
  const queueContext = useQueueContext();

  const { handleRightClick, contextMenu, ContextMenu } =
    useContextMenu<IPlaylist>("header");

  const handleMouseEnter = (menu) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setOpenMenu(menu);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpenMenu(null);
      setShowTagsSubmenu(false);
    }, 200);
  };

  const handleTagsMouseEnter = () => {
    if (tagsTimeoutRef.current) {
      clearTimeout(tagsTimeoutRef.current);
    }
    setShowTagsSubmenu(true);
  };

  const handleTagsMouseLeave = () => {
    tagsTimeoutRef.current = setTimeout(() => {
      setShowTagsSubmenu(false);
    }, 200);
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
  };

  return (
    <header className="h-14 flex items-center border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm px-4">
      <nav>
        <ul className="flex items-center gap-1">
          {/* Audios Menu */}
          <li
            className="relative"
            onMouseEnter={() => handleMouseEnter("audios")}
            onMouseLeave={handleMouseLeave}
          >
            <button className="px-3 py-1.5 text-sm text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors">
              Audios
            </button>
            {openMenu === "audios" && (
              <ul className="absolute top-full left-0 mt-1 w-44 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl shadow-black/40 py-1 z-50">
                <li>
                  <button
                    onClick={() => playlistContext.setCurrentPlaylist(null)}
                    className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
                  >
                    All Audios
                  </button>
                </li>
                <li
                  className="relative group"
                  onMouseEnter={handleTagsMouseEnter}
                  onMouseLeave={handleTagsMouseLeave}
                >
                  <span className="flex items-center justify-between px-3 py-2 text-sm text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 cursor-default transition-colors">
                    Tags
                    <svg
                      className="w-3 h-3 text-zinc-500"
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
                  </span>
                  {showTagsSubmenu && (
                    <ul className="absolute left-full top-0 ml-1 w-44 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl shadow-black/40 py-1 z-50">
                      {tagsList.map((tag, index) => (
                        <li key={index}>
                          <button
                            onClick={() => console.log("Selected tag:", tag)}
                            className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
                          >
                            {tag}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              </ul>
            )}
          </li>

          {/* Artists Menu */}
          <li
            className="relative"
            onMouseEnter={() => handleMouseEnter("artists")}
            onMouseLeave={handleMouseLeave}
          >
            <button className="px-3 py-1.5 text-sm text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors">
              Artists
            </button>
            {openMenu === "artists" && (
              <ul className="absolute top-full left-0 mt-1 w-44 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl shadow-black/40 py-1 z-50">
                {artistsList.map((artist, index) => (
                  <li key={index}>
                    <button
                      onClick={() => console.log("Selected artist:", artist)}
                      className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
                    >
                      {artist}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </li>

          {/* Playlists Menu */}
          <li
            className="relative"
            onMouseEnter={() => handleMouseEnter("playlists")}
            onMouseLeave={handleMouseLeave}
          >
            <button className="px-3 py-1.5 text-sm text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors">
              Playlists
            </button>
            {openMenu === "playlists" && (
              <ul className="absolute top-full left-0 mt-1 w-52 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl shadow-black/40 py-1 z-50">
                <li>
                  <button
                    onClick={() => {
                      setIsModalOpen(true);
                      setOpenMenu(null);
                    }}
                    className="w-full text-left px-3 py-2 text-sm font-medium text-purple-400 hover:text-purple-300 hover:bg-zinc-800 transition-colors"
                  >
                    + Create Playlist
                  </button>
                </li>
                <li className="my-1 border-t border-zinc-700/60" />
                {Array.from(playlistContext.playlists).map(([key, value]) => (
                  <li
                    key={key}
                    onContextMenu={(e) => handleRightClick(e, value)}
                  >
                    <button
                      onClick={() => {
                        playlistContext.setCurrentPlaylist(key);
                        setOpenMenu(null);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-colors truncate"
                    >
                      {value.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </li>
        </ul>
      </nav>

      {/* Context Menu */}
      <ContextMenu>
        <button
          onClick={() => console.log("Play now:", contextMenu?.data)}
          className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
        >
          Play now
        </button>
        <button
          onClick={() => {
            if (contextMenu) queueContext.queuePlaylist(contextMenu.data);
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

      {/* Create Playlist Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="space-y-3">
          <input
            id="playlist-input"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter playlist name..."
            className="w-full px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />

          <div className="flex items-center gap-2">
            <input
              id="queue-checkbox"
              type="checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="w-4 h-4 rounded accent-purple-500 cursor-pointer"
            />
            <label
              htmlFor="queue-checkbox"
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
    </header>
  );
}
