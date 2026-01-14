import { useAudioContext } from "../context/AudioContext";
import { useQueueContext } from "../context/QueueContext";
import style from "./AudioCatalog.module.scss";

export function AudioCatalog() {
  const audioContext = useAudioContext();
  const queueContext = useQueueContext();

  return (
    <div className={style.catalog}>
      <header>
        <div>
          <span>placeholder</span>
        </div>
      </header>
      <div>
        <ul className={style.audiosWrapper}>
          {audioContext.audios.map((audio) => {
            return (
              <li className={style.individualAudioWrapper} key={audio.id}>
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
          })}
        </ul>
      </div>
    </div>
  );
}
