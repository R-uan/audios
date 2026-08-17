import { useMemo } from "react";
import { X } from "lucide-react";
import { useFilterContext } from "../context/AudioFilterContext";
import { useAudioContext } from "../context/AudioContext";
import { Input } from "./ui/Input";
import { Slider } from "./ui/Slider";
import { TagInput } from "./ui/TagInput";
import { AutocompleteInput } from "./ui/AutocompleteInput";

export function AudioFilter() {
  const { filters, setFilters, set } = useFilterContext();
  const audioContext = useAudioContext();

  const artistSuggestions = useMemo(
    () =>
      [...new Set(audioContext.audios.map((a) => a.artist).filter(Boolean))].sort(),
    [audioContext.audios],
  );

  const tagSuggestions = useMemo(
    () =>
      [...new Set(audioContext.audios.flatMap((a) => a.metadata.tags))].sort(),
    [audioContext.audios],
  );

  const hasAnyFilter =
    filters.name ||
    filters.artist ||
    filters.includeTags.length > 0 ||
    filters.excludeTags.length > 0 ||
    filters.hoursAgo !== null;

  return (
    <div className="space-y-2">
      {/* Title */}
      <Input
        value={filters.name}
        onChange={(e) => set("name", e.target.value)}
        placeholder="Title..."
        className="px-2 py-1.5 text-xs"
      />

      {/* Artist */}
      <AutocompleteInput
        value={filters.artist}
        onChange={(v) => set("artist", v)}
        suggestions={artistSuggestions}
        placeholder="Artist..."
      />

      {/* Updated within */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-muted">Updated within</span>
          {filters.hoursAgo !== null ? (
            <div className="flex items-center gap-1.5">
              <span className="text-xs tabular-nums text-accent">
                {filters.hoursAgo === 0 ? "this hour" : `${filters.hoursAgo}h`}
              </span>
              <button
                onClick={() => set("hoursAgo", null)}
                aria-label="Clear updated within filter"
                className="text-muted-faint hover:text-foreground-soft transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <span className="text-xs text-muted-faint">off</span>
          )}
        </div>
        <Slider
          min={0}
          max={168}
          step={1}
          value={filters.hoursAgo ?? 168}
          onChange={(e) => set("hoursAgo", parseInt(e.target.value))}
          className="w-full accent-accent"
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-muted-faint">this hour</span>
          <span className="text-xs text-muted-faint">168h</span>
        </div>
      </div>

      {/* Include tags */}
      <TagInput
        label="Include"
        labelClassName="text-positive"
        tagClassName="bg-positive/10 border-positive/30 text-positive"
        removeClassName="hover:text-positive"
        tags={filters.includeTags}
        onAdd={(t) => set("includeTags", [...filters.includeTags, t])}
        onRemove={(t) =>
          set(
            "includeTags",
            filters.includeTags.filter((x) => x !== t),
          )
        }
        suggestions={tagSuggestions}
        placeholder="Include tag..."
      />

      {/* Exclude tags */}
      <TagInput
        label="Exclude"
        labelClassName="text-danger"
        tagClassName="bg-danger/10 border-danger/30 text-danger"
        removeClassName="hover:text-danger"
        tags={filters.excludeTags}
        onAdd={(t) => set("excludeTags", [...filters.excludeTags, t])}
        onRemove={(t) =>
          set(
            "excludeTags",
            filters.excludeTags.filter((x) => x !== t),
          )
        }
        suggestions={tagSuggestions}
        placeholder="Exclude tag..."
      />

      {/* Clear */}
      {hasAnyFilter && (
        <button
          onClick={() =>
            setFilters((prev) => ({
              ...prev,
              name: "",
              artist: "",
              includeTags: [],
              excludeTags: [],
              hoursAgo: null,
            }))
          }
          className="w-full px-2 py-1 text-xs text-muted hover:text-foreground hover:bg-surface-2 rounded-md transition-colors"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
