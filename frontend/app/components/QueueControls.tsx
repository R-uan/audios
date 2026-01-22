import { useEffect, useRef, useState } from "react";
import { usePlayerContext } from "../context/PlayerContext";
import style from "./AudioControls.module.scss";
import { IAudio } from "../models/IAudio";
import { useQueueContext } from "../context/QueueContext";
import { AudioRequest } from "../shared/AudioRequests";

export function AudioControls() {
  const queueContext = useQueueContext();
  const [playing, setPlaying] = useState(false);
  const [currentPlaying, setCurrent] = useState<IAudio | null>(null);
  const [currentTime, setCurrentTime] = useState<string>("00:00");
  const [totalDuration, setTotalDuration] = useState<string>("00:00");
  const audioPlayerRef = useRef<HTMLAudioElement>(null);
  const audioPlayer = audioPlayerRef.current;

  useEffect(() => {
    const nextAudio = queueContext.queue[queueContext.queuePointer];
    if (nextAudio) {
      setCurrent(nextAudio);
      setCurrentTime("00:00");
      setTotalDuration("00:00"); // Reset duration when track changes
    }
  }, [queueContext.queuePointer, queueContext.queue]);

  // Handle metadata when audio element or currentPlaying changes
  useEffect(() => {
    if (audioPlayer && currentPlaying) {
      // If duration is already available, set it immediately
      if (!isNaN(audioPlayer.duration) && isFinite(audioPlayer.duration)) {
        updateDuration(audioPlayer.duration);
      }
    }
  }, [audioPlayer, currentPlaying]);

  function updateDuration(audioDurationSeconds: number) {
    if (currentPlaying && currentPlaying.duration !== audioDurationSeconds) {
      AudioRequest.UpdateDuration(currentPlaying.id, audioDurationSeconds);
    }

    const formattedDuration =
      audioDurationSeconds < 3600
        ? new Date(audioDurationSeconds * 1000).toISOString().slice(14, 19)
        : new Date(audioDurationSeconds * 1000).toISOString().slice(11, 19);

    setTotalDuration(formattedDuration);
  }

  function handleTogglePlay() {
    if (audioPlayer) {
      if (playing) {
        audioPlayer.pause();
      } else {
        audioPlayer.play().catch((err) => {
          console.error("Playback failed:", err);
          setPlaying(false);
        });
      }
      setPlaying(!playing);
    }
  }

  function handlePlayNext() {
    queueContext.increasePointer();
  }

  function handlePlayPrevious() {
    queueContext.decreasePointer();
  }

  function handleAudioEnd() {
    setTimeout(() => queueContext.increasePointer(), 2000);
  }

  function handleMetadata() {
    if (audioPlayer) {
      const audioDurationSeconds = audioPlayer.duration;

      if (!isNaN(audioDurationSeconds) && isFinite(audioDurationSeconds)) {
        updateDuration(audioDurationSeconds);
      }
    }
  }

  function handleTimeUpdate() {
    if (audioPlayer && playing) {
      const audioDuration = audioPlayer.duration;
      const formattedTime =
        audioDuration < 3600
          ? new Date(audioPlayer.currentTime * 1000).toISOString().slice(14, 19)
          : new Date(audioPlayer.currentTime * 1000)
              .toISOString()
              .slice(11, 19);

      setCurrentTime(formattedTime);
    }
  }

  return (
    <div className={style.audioControls}>
      <div className={style.left}>
        {currentPlaying && (
          <>
            <div>
              <span>{currentPlaying.title}</span>
            </div>
            <div>
              <span>{currentPlaying.artist}</span>
            </div>
          </>
        )}
      </div>
      <div className={style.middle}>
        <div className={style.controls}>
          <button>Shuffle</button>
          <button onClick={handlePlayPrevious}>Back</button>
          <button onClick={handleTogglePlay}>
            {playing ? "Pause" : "Play"}
          </button>
          <button onClick={handlePlayNext}>Forward</button>
          <button>Repeat</button>
        </div>
        <div className="flex">
          <span>{currentTime}</span>
          {currentPlaying && (
            <audio
              ref={audioPlayerRef}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              src={currentPlaying.source ?? undefined}
              onEnded={handleAudioEnd}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleMetadata}
              autoPlay
            />
          )}
          <div className={style.durationBar}></div>
          <span>{totalDuration}</span>
        </div>
      </div>
      <div className={style.right}>Right</div>
    </div>
  );
}
