import { useEffect, useRef, useState } from "react";
import { IAudio } from "../models/IAudio";
import { useQueueContext } from "../context/QueueContext";
import { useAudioCatalog } from "../hooks/useAudioCatalog";

export function AudioControls() {
  const queueContext = useQueueContext();
  const audioCatalog = useAudioCatalog();

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>("00:00");
  const [currentPlaying, setCurrent] = useState<IAudio | null>(null);
  const [totalDuration, setTotalDuration] = useState<string>("00:00");

  const audioPlayerRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const nextAudio = queueContext.queue[queueContext.queuePointer];
    if (nextAudio) {
      setCurrent(nextAudio);
      setCurrentTime("00:00");
      navigator.mediaSession.metadata = new MediaMetadata({
        title: nextAudio.title,
        artist: nextAudio.artist
      });
    }
    if (queueContext.queuePointer == -1) {
      setCurrent(null);
      setPlaying(false);
      setCurrentTime("00:00");
      setTotalDuration("00:00");
    }
  }, [queueContext.queuePointer, queueContext.queue]);

  function updateDuration(audioDurationSeconds: number) {
    const formattedDuration =
      audioDurationSeconds < 3600
        ? new Date(audioDurationSeconds * 1000).toISOString().slice(14, 19)
        : new Date(audioDurationSeconds * 1000).toISOString().slice(11, 19);
    setTotalDuration(formattedDuration);
  }

  function handleTogglePlay() {
    if (audioPlayerRef.current) {
      if (playing) {
        audioPlayerRef.current.pause();
      } else {
        audioPlayerRef.current.play().catch((err) => {
          console.error("Playback failed:", err);
          setPlaying(false);
        });
      }
      setPlaying(!playing);
    }
  }

  function handlePlayNext() {
    queueContext.playNext();
  }

  function handlePlayPrevious() {
    queueContext.playPrevious();
  }

  function handleAudioEnd() {
    setTimeout(() => queueContext.playNext(), 2000);
  }

  function handleMetadata() {
    if (audioPlayerRef.current) {
      const audioDurationSeconds = audioPlayerRef.current.duration;
      if (!isNaN(audioDurationSeconds) && isFinite(audioDurationSeconds)) {
        updateDuration(audioDurationSeconds);
        if (currentPlaying && currentPlaying.metadata.duration == null) {
          currentPlaying.metadata.duration = Math.floor(audioDurationSeconds);
          audioCatalog.handleUpdateAudio(currentPlaying, [], []);
        }
      }
    }
  }

  function handleTimeUpdate() {
    if (audioPlayerRef.current && playing) {
      const audioDuration = audioPlayerRef.current.duration;
      const formattedTime =
        audioDuration < 3600
          ? new Date(audioPlayerRef.current.currentTime * 1000)
              .toISOString()
              .slice(14, 19)
          : new Date(audioPlayerRef.current.currentTime * 1000)
              .toISOString()
              .slice(11, 19);

      setCurrentTime(formattedTime);
    }
  }

  return (
    <div className="h-24 shrink-0 flex items-center justify-between gap-4 px-6 border-t border-zinc-800 bg-zinc-900/95 backdrop-blur-md">
      {/* Left — Now Playing */}
      <div className="flex items-center gap-3 w-64 min-w-0">
        {currentPlaying ? (
          <>
            <div className="w-10 h-10 rounded-md bg-zinc-800 shrink-0 flex items-center justify-center text-zinc-600">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-zinc-100 truncate">
              </p>
              <p className="text-xs text-zinc-500 truncate">
                {currentPlaying.artist}
              </p>
            </div>
          </>
        ) : (
          <div className="text-xs text-zinc-600">Nothing playing</div>
        )}
      </div>

      {/* Center — Controls + Progress */}
      <div className="flex flex-col items-center gap-2 flex-1 max-w-xl">
        {/* Buttons */}
        <div className="flex items-center gap-2">
          {/* Shuffle */}
          <button
            className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            title="Shuffle"
            onClick={queueContext.shuffleQueue}
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
                d="M16 3h5v5M4 20L21 3M16 21h5v-5M4 4l5 5"
              />
            </svg>
          </button>

          {/* Previous */}
          <button
            onClick={handlePlayPrevious}
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            title="Previous"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>

          {/* Play / Pause */}
          <button
            onClick={handleTogglePlay}
            className="w-9 h-9 rounded-full bg-zinc-100 hover:bg-white text-zinc-900 flex items-center justify-center transition-colors shadow-md"
            title={playing ? "Pause" : "Play"}
          >
            {playing ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <rect x="5" y="4" width="4" height="16" rx="1" />
                <rect x="15" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 4.5v15l13-7.5z" />
              </svg>
            )}
          </button>
          {/* Next */}
          <button
            onClick={handlePlayNext}
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            title="Next"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 18l8.5-6L6 6v12zm2-8.14L11.03 12 8 14.14V9.86zM16 6h2v12h-2z" />
            </svg>
          </button>

          {/* Repeat */}
          <button
            className={`p-1.5 rounded-md transition-colors ${
              queueContext.repeating
                ? "text-purple-400 bg-zinc-800"
                : "text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800"
            }`}
            title="Repeat"
            onClick={() => queueContext.toggleRepeat()}
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full flex items-center gap-2">
          <span className="text-xs tabular-nums text-zinc-500 w-10 text-right">
            {currentTime}
          </span>
          <div
            className="relative flex-1 h-1 bg-zinc-700 rounded-full group cursor-pointer"
            onClick={(e) => {
              if (!audioPlayerRef.current || !currentPlaying) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              audioPlayerRef.current.currentTime =
                pct * audioPlayerRef.current.duration;
            }}
          >
            <div
              className="absolute inset-y-0 left-0 bg-zinc-100 group-hover:bg-purple-400 rounded-full transition-colors"
              style={{
                width: audioPlayerRef.current?.duration
                  ? `${(audioPlayerRef.current.currentTime / audioPlayerRef.current.duration) * 100}%`
                  : "0%",
              }}
            />
          </div>
          <span className="text-xs tabular-nums text-zinc-500 w-10">
            {totalDuration}
          </span>
        </div>

        {currentPlaying && (
          <audio
            ref={audioPlayerRef}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            src={
              currentPlaying.local
                ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/${currentPlaying.source}`
                : (currentPlaying.source ?? undefined)
            }
            onEnded={handleAudioEnd}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleMetadata}
            autoPlay
          />
        )}
      </div>

      {/* Right — Volume */}
      <div className="flex items-center gap-2 w-64 justify-end">
        <button
          className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          onClick={() => {
            if (audioPlayerRef.current)
              audioPlayerRef.current.muted = !audioPlayerRef.current.muted;
          }}
          title="Mute"
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
              d="M15.536 8.464a5 5 0 010 7.072M12 6v12m0 0l-4-4H5a1 1 0 01-1-1v-2a1 1 0 011-1h3l4-4z"
            />
          </svg>
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          defaultValue={1}
          onChange={(e) => {
            if (audioPlayerRef.current)
              audioPlayerRef.current.volume = parseFloat(e.target.value);
          }}
          className="w-24 h-1 appearance-none rounded-full bg-zinc-700 accent-zinc-100 cursor-pointer"
        />
      </div>
    </div>
  );
}
