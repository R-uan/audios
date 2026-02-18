import { memo, MouseEvent } from "react";
import { IAudio } from "../models/IAudio";

export const AudioWrapper = memo(
  ({
    audio,
    onContextMenuHandler,
  }: {
    audio: IAudio;
    onContextMenuHandler: (e: MouseEvent, audio: IAudio) => void;
  }) => {
    return (
      <li
        key={audio.id}
        onContextMenu={(e) => onContextMenuHandler(e, audio)}
        className="group flex items-center justify-between px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors cursor-default"
      >
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-sm text-zinc-200 group-hover:text-zinc-100 truncate leading-snug transition-colors">
            {audio.title.length <= 40
              ? audio.title
              : `${audio.title.slice(0, 37)}…`}
          </span>
          <span className="text-xs text-zinc-500 group-hover:text-zinc-400 truncate mt-0.5 transition-colors">
            {audio.artist}
          </span>
        </div>
        <span className="text-xs tabular-nums text-zinc-600 group-hover:text-zinc-400 shrink-0 ml-4 transition-colors">
          {audio.duration ?? "??:??"}
        </span>
      </li>
    );
  },
);
