import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { AudioFilter } from "./AudioFilter";
import { PlaylistSection } from "./PlaylistSection";
import { usePlaylistContext } from "../context/PlaylistContext";

export function LeftSection() {
  const playlistContext = usePlaylistContext();
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <section className="flex flex-col w-60 shrink-0 bg-surface border-r border-border overflow-y-auto">
      <div className="px-4 py-3 h-12 flex items-center border-b border-border">
        <h1 className="text-xs font-semibold uppercase tracking-widest text-muted-faint">
          Library
        </h1>
      </div>

      <nav className="flex flex-col gap-1 p-2">
        <button
          onClick={() => playlistContext.setCurrentPlaylist(null)}
          className="w-full flex items-center px-2 py-1.5 rounded-md text-sm font-medium text-muted hover:text-foreground hover:bg-surface-2 transition-colors"
        >
          All Audios
        </button>

        <div className="my-1 border-t border-border" />

        <PlaylistSection />

        <div className="my-1 border-t border-border" />

        <div>
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm font-medium text-muted hover:text-foreground hover:bg-surface-2 transition-colors"
          >
            <span>Filters</span>
            <ChevronRight
              className={`w-3 h-3 transition-transform duration-200 ${filtersOpen ? "rotate-90" : ""}`}
            />
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
