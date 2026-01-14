import { useAudioContext } from "../context/AudioContext";
import style from "./AudioCatalog.module.scss";

export function AudioCatalog() {
  const audioContext = useAudioContext();

  return (
    <div className={style.catalog}>
      <div>
        <ul className={style.audiosWrapper}>
          {audioContext.audios.map((audio) => {
            return (
              <li className={style.individualAudioWrapper} key={audio.id}>
                <div>
                  <div className={style.audioTitleWrapper}>
                    <span>{audio.title}</span>
                  </div>
                  <div className={style.audioArtistWrapper}>
                    <span>{audio.artist}</span>
                  </div>
                </div>
                <div>
                  <button>B</button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
