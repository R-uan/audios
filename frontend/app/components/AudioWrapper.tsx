import { memo, MouseEvent } from "react";
import { IAudio } from "../models/IAudio";
import style from "./AudioWrapper.module.scss";

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
        className={style.individualAudioWrapper}
        key={audio.id}
        onContextMenu={(e) => onContextMenuHandler(e, audio)}
      >
        <div>
          <div className={style.audioTitleWrapper}>
            <span>
              {audio.title.length <= 40
                ? audio.title
                : `${audio.title.slice(0, 37)}...`}
            </span>
          </div>
          <div className={style.audioArtistWrapper}>
            <span>{audio.artist}</span>
          </div>
        </div>
        <div>
          <span>{audio.duration ?? "??:??"}</span>
        </div>
      </li>
    );
  },
);
