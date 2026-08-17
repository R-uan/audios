import { ArrowDown, ArrowUp, ListMusic } from "lucide-react";
import { IAudio } from "../models/IAudio";
import { IPlaylist } from "../models/IPlaylist";
import { IconButton } from "./ui/IconButton";
import { useFilterContext, SortBy } from "../context/AudioFilterContext";

const sortOptions: { value: SortBy; label: string }[] = [
  { value: "default", label: "Default order" },
  { value: "addedAt", label: "Recently added" },
  { value: "title", label: "Title" },
  { value: "artist", label: "Artist" },
  { value: "duration", label: "Duration" },
];

interface AudioCatalogHeaderProps {
  currentPlaylist: IPlaylist | null;
  audiosToRender: IAudio[] | null;
  onQueueAll: () => void;
}

export function AudioCatalogHeader({
  currentPlaylist,
  audiosToRender,
  onQueueAll,
}: AudioCatalogHeaderProps) {
  const { filters, set } = useFilterContext();
  const isDefault = filters.sortBy === "default";

  return (
    <header className="flex items-center justify-between h-12 px-6 py-3 border-b border-border shrink-0">
      <span className="text-sm font-semibold text-foreground">
        {currentPlaylist ? currentPlaylist.name : "All Audios"}
      </span>
      <div className="flex gap-2 items-center">
        <select
          value={filters.sortBy}
          onChange={(e) => set("sortBy", e.target.value as SortBy)}
          aria-label="Sort by"
          className="h-7 px-2 text-xs rounded-md bg-surface-2 border border-border-strong text-foreground-soft focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
        >
          {sortOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <IconButton
          label={filters.sortDir === "asc" ? "Sort ascending" : "Sort descending"}
          onClick={() => set("sortDir", filters.sortDir === "asc" ? "desc" : "asc")}
          disabled={isDefault}
        >
          {filters.sortDir === "asc" ? (
            <ArrowUp className="w-3.5 h-3.5" />
          ) : (
            <ArrowDown className="w-3.5 h-3.5" />
          )}
        </IconButton>

        <IconButton label="Queue all" onClick={onQueueAll}>
          <ListMusic className="w-4 h-4" />
        </IconButton>
        <span className="text-xs text-muted-faint tabular-nums">
          {audiosToRender ? audiosToRender.length : 0} tracks
        </span>
      </div>
    </header>
  );
}
