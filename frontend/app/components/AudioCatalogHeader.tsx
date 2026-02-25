import { IAudio } from "../models/IAudio";
import { IPlaylist } from "../models/IPlaylist";

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
  return (
    <header className="flex items-center justify-between h-12 px-6 py-3 border-b border-zinc-800 shrink-0">
      <span className="text-sm font-semibold text-zinc-100">
        {currentPlaylist ? currentPlaylist.name : "All Audios"}
      </span>
      <div className="flex gap-2 items-center">
        <button
          onClick={onQueueAll}
          className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          title="Queue all"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 10h10M4 14h7M15 17h6M18 14v6"
            />
          </svg>
        </button>
        <span className="text-xs text-zinc-600 tabular-nums">
          {audiosToRender ? audiosToRender.length : 0} tracks
        </span>
      </div>
    </header>
  );
}
