import { MouseEvent, useCallback, useEffect, useState } from "react";
import { useAudioContext } from "../context/AudioContext";
import { useQueueContext } from "../context/QueueContext";
import { IAudio } from "../models/IAudio";
import style from "./AudioCatalog.module.scss";
import { AudioWrapper } from "./AudioWrapper";

interface ContextMenuType {
  x: number;
  y: number;
  audio: IAudio;
}

export function AudioCatalog() {
  const audioContext = useAudioContext();
  const queueContext = useQueueContext();
  const [contextMenu, setContextMenu] = useState<ContextMenuType | null>(null);

  const handleContextMenu = useCallback((e: MouseEvent, audio: IAudio) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      audio: audio, // Store which audio was right-clicked
    });
  }, []);

  const handleQueueAudio = () => {
    if (contextMenu != null) queueContext.queueAudio(contextMenu?.audio);
  };

  const handlePlayNow = () => {};

  useEffect(() => {
    const handleCloseMenu = () => setContextMenu(null);
    document.addEventListener("click", handleCloseMenu);
    return () => document.removeEventListener("click", handleCloseMenu);
  }, []);

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
              <AudioWrapper
                key={audio.id}
                audio={audio}
                onContextMenuHandler={handleContextMenu}
              />
            );
          })}
        </ul>

        {contextMenu && (
          <div
            style={{
              top: contextMenu.y,
              left: contextMenu.x,
            }}
            className={style.contextMenu}
          >
            <button onClick={handlePlayNow}>Play now</button>
            <button onClick={handleQueueAudio}>Add to queue</button>
          </div>
        )}
      </div>
    </div>
  );
}
