import { MouseEvent, useCallback, useEffect, useState } from "react";
import { useAudioContext } from "../context/AudioContext";
import { useQueueContext } from "../context/QueueContext";
import { IAudio } from "../models/IAudio";
import style from "./AudioCatalog.module.scss";
import { AudioWrapper } from "./AudioWrapper";
import { usePlaylistContext } from "../context/PlaylistContext";
import { useContextMenu } from "./ContextMenu";

export function AudioCatalog() {
  const audioContext = useAudioContext();
  const queueContext = useQueueContext();
  const playlistContext = usePlaylistContext();

  // Use the custom hook
  const { handleRightClick, contextMenu, ContextMenu } =
    useContextMenu<IAudio>("audio_catalog");

  const handleQueueAudio = () => {
    if (contextMenu?.data) {
      queueContext.queueAudio(contextMenu.data);
    }
  };

  const handlePlayNow = () => {
    if (contextMenu?.data) {
      // Add your play now logic here
      console.log("Playing now:", contextMenu.data);
    }
  };

  return (
    <div className={style.catalog}>
      <header>
        <div>
          <span>placeholder</span>
        </div>
      </header>
      <div>
        <ul className={style.audiosWrapper}>
          {playlistContext.currentPlaylist == null
            ? audioContext.audios.map((audio) => {
                return (
                  <AudioWrapper
                    key={audio.id}
                    audio={audio}
                    onContextMenuHandler={handleRightClick}
                  />
                );
              })
            : playlistContext.currentPlaylist.audios.map((audioId) => {
                const audio = audioContext.audios.find((a) => a.id == audioId);
                if (audio != null)
                  return (
                    <AudioWrapper
                      key={audio.id}
                      audio={audio}
                      onContextMenuHandler={handleRightClick}
                    />
                  );
              })}
        </ul>

        {/* Render the context menu using the component from the hook */}
        <ContextMenu>
          <button onClick={handlePlayNow}>Play now</button>
          <button onClick={handleQueueAudio}>Add to queue</button>
        </ContextMenu>
      </div>
    </div>
  );
}
