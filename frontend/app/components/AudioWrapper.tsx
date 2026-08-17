import { memo } from "react";
import { ListPlus, Play } from "lucide-react";
import { IAudio } from "../models/IAudio";
import { Tooltip } from "./ui/Tooltip";
import { Artwork } from "./ui/Artwork";
import { IconButton } from "./ui/IconButton";

export const AudioWrapper = memo(
  ({
    audio,
    onPlay,
    onQueue,
    onContextMenuHandler,
  }: {
    audio: IAudio;
    onPlay: (audio: IAudio) => void;
    onQueue: (audio: IAudio) => void;
    onContextMenuHandler: (e: React.MouseEvent, audio: IAudio) => void;
  }) => {
    function secondsToMinutes(seconds: number) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
    }
    return (
      <li
        key={audio.id}
        onContextMenu={(e) => onContextMenuHandler(e, audio)}
        onClick={() => onPlay(audio)}
        className="group flex items-center gap-3 px-3 py-2 rounded-md hover:bg-surface-2 transition-colors cursor-pointer"
      >
        {/* Artwork */}
        <div className="relative shrink-0">
          <Artwork seed={audio.title} size={40} alt={audio.title} />
          <div className="absolute inset-0 rounded-md bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Play className="w-4 h-4 text-white" fill="currentColor" />
          </div>
        </div>

        {/* Title + Artist */}
        <div className="flex flex-col min-w-0 w-64 shrink-0">
          <Tooltip content={audio.title} className="flex-1">
            <span className="block text-sm text-foreground-soft group-hover:text-foreground truncate leading-snug transition-colors">
              {audio.title.length <= 40
                ? audio.title
                : `${audio.title.slice(0, 37)}…`}
            </span>
          </Tooltip>

          <span className="text-xs text-muted group-hover:text-muted truncate mt-0.5 transition-colors">
            {audio.artist}
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-1 flex-wrap gap-1.5 min-w-0">
          {audio.metadata.tags.map((t) => (
            <span
              key={t}
              className="px-1.5 py-0.5 text-xs text-muted bg-surface-2 group-hover:bg-surface-3 border border-border rounded transition-colors"
            >
              {t}
            </span>
          ))}
        </div>

        {/* Duration */}
        <span className="text-xs tabular-nums text-muted group-hover:text-foreground-soft shrink-0 transition-colors">
          {audio.metadata.duration
            ? secondsToMinutes(audio.metadata.duration)
            : "??:??"}
        </span>

        {/* Hover action */}
        <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <IconButton
            label="Add to queue"
            onClick={(e) => {
              e.stopPropagation();
              onQueue(audio);
            }}
          >
            <ListPlus className="w-4 h-4" />
          </IconButton>
        </div>
      </li>
    );
  },
);
