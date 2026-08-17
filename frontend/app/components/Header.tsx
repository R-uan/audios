import { ListMusic, Search, X } from "lucide-react";
import { CreateSGAudioForm } from "./form/CreateSGAudioForm";
import { CreateAudioForm } from "./form/CreateAudioForm";
import { IconButton } from "./ui/IconButton";
import { useFilterContext } from "../context/AudioFilterContext";

export function Header({ onToggleQueue }: { onToggleQueue: () => void }) {
  const { filters, set } = useFilterContext();

  return (
    <header className="h-14 justify-between flex items-center gap-4 border-b border-border bg-surface/80 backdrop-blur-sm px-4">
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-sm font-semibold tracking-wide text-foreground select-none">
          Audio Archive
        </span>
      </div>

      <div className="flex-1 flex justify-center max-w-xl mx-auto">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-faint pointer-events-none" />
          <input
            value={filters.search}
            onChange={(e) => set("search", e.target.value)}
            placeholder="Search title, artist, or tag..."
            aria-label="Search"
            className="w-full h-8 pl-8 pr-8 text-sm rounded-md bg-surface-2 border border-border-strong text-foreground placeholder-muted-faint focus:outline-none focus:ring-1 focus:ring-accent focus:border-transparent transition-all"
          />
          {filters.search && (
            <button
              onClick={() => set("search", "")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-faint hover:text-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center shrink-0">
        <CreateAudioForm />
        <CreateSGAudioForm />
        <IconButton label="Toggle queue" onClick={onToggleQueue}>
          <ListMusic className="w-4 h-4" />
        </IconButton>
      </div>
    </header>
  );
}
