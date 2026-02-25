import { useState } from "react";
import { AudioFilter } from "./AudioFilter";
import { PlaylistSection } from "./PlaylistSection";
import { usePlaylistContext } from "../context/PlaylistContext";

export function LeftSection() {
  const playlistContext = usePlaylistContext();
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <section className="flex flex-col w-60 shrink-0 bg-zinc-900 border-r border-zinc-800 overflow-y-auto">
      <div className="px-4 py-3 h-12 flex items-center border-b border-zinc-800">
        <h1 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Library
        </h1>
      </div>

      <nav className="flex flex-col gap-1 p-2">
        <button
          onClick={() => playlistContext.setCurrentPlaylist(null)}
          className="w-full flex items-center px-2 py-1.5 rounded-md text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
        >
          All Audios
        </button>

        <div className="my-1 border-t border-zinc-800" />

        <PlaylistSection />

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
    </section>
  );
}
