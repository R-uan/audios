import { useCallback, useEffect, useRef, useState } from "react";
import {
  Pause,
  Play,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { IAudio } from "../models/IAudio";
import { useQueueContext } from "../context/QueueContext";
import { useAudioCatalog } from "../hooks/useAudioCatalog";
import { IconButton } from "./ui/IconButton";
import { Slider } from "./ui/Slider";
import { Artwork } from "./ui/Artwork";

const LOAD_TIMEOUT_MS = 10_000;

export function AudioControls() {
  const queueContext = useQueueContext();
  const audioCatalog = useAudioCatalog();

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>("00:00");
  const [currentPlaying, setCurrent] = useState<IAudio | null>(null);
  const [totalDuration, setTotalDuration] = useState<string>("00:00");

  const audioPlayerRef = useRef<HTMLAudioElement>(null);
  const loadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipGuardRef = useRef(false);
  const currentIdRef = useRef<string | null>(null);
  const queueContextRef = useRef(queueContext);

  useEffect(() => {
    queueContextRef.current = queueContext;
  });

  const clearLoadTimeout = useCallback(() => {
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }
  }, []);

  const skipCurrent = useCallback(() => {
    if (skipGuardRef.current) return;
    skipGuardRef.current = true;
    clearLoadTimeout();
    setPlaying(false);
    queueContextRef.current.playNext();
  }, [clearLoadTimeout]);

  useEffect(() => {
    const nextAudio = queueContext.queue[queueContext.queuePointer];

    if (queueContext.queuePointer == -1 || !nextAudio) {
      currentIdRef.current = null;
      setCurrent(null);
      setPlaying(false);
      setCurrentTime("00:00");
      setTotalDuration("00:00");
      return;
    }

    setCurrent(nextAudio);

    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: nextAudio.title,
        artist: nextAudio.artist,
        artwork: undefined
      });
    }

    const idChanged = nextAudio.id !== currentIdRef.current;
    currentIdRef.current = nextAudio.id;

    if (idChanged) {
      skipGuardRef.current = false;
      clearLoadTimeout();
      setCurrentTime("00:00");
      setTotalDuration("00:00");
      loadTimeoutRef.current = setTimeout(() => skipCurrent(), LOAD_TIMEOUT_MS);
    }
  }, [queueContext.queuePointer, queueContext.queue, skipCurrent, clearLoadTimeout]);

  function updateDuration(audioDurationSeconds: number) {
    const formattedDuration =
      audioDurationSeconds < 3600
        ? new Date(audioDurationSeconds * 1000).toISOString().slice(14, 19)
        : new Date(audioDurationSeconds * 1000).toISOString().slice(11, 19);
    setTotalDuration(formattedDuration);
  }

  useEffect(() => {
    if (!("mediaSession" in navigator)) return
    navigator.mediaSession.setActionHandler("play", () => {
      audioPlayerRef.current?.play()
      setPlaying(true)
    })
    navigator.mediaSession.setActionHandler("pause", () => {
      audioPlayerRef.current?.pause()
      setPlaying(false)
    })
  }, [])

  // next/prev — need fresh queueContext
  useEffect(() => {
    if (!("mediaSession" in navigator)) return
    navigator.mediaSession.setActionHandler("nexttrack", () => queueContext.playNext())
    navigator.mediaSession.setActionHandler("previoustrack", () => queueContext.playPrevious())
  }, [queueContext])

  useEffect(() => {
    if (!("mediaSession" in navigator)) return
    navigator.mediaSession.playbackState = playing ? "playing" : "paused"
  }, [playing])

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

  const handleTogglePlayRef = useRef(handleTogglePlay);
  useEffect(() => {
    handleTogglePlayRef.current = handleTogglePlay;
  });

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== " ") return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        target.closest("input, textarea, select, [contenteditable]")
      )
        return;
      e.preventDefault();
      handleTogglePlayRef.current();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function handlePlayNext() {
    queueContext.playNext();
  }

  function handlePlayPrevious() {
    queueContext.playPrevious();
  }

  function handleAudioEnd() {
    setTimeout(() => queueContext.playNext(), 2000);
  }

  function seekToFraction(fraction: number) {
    const player = audioPlayerRef.current;
    if (!player || !currentPlaying) return;
    if (!isFinite(player.duration)) return;
    player.currentTime = Math.min(1, Math.max(0, fraction)) * player.duration;
  }

  function seekBy(deltaSeconds: number) {
    const player = audioPlayerRef.current;
    if (!player || !currentPlaying) return;
    if (!isFinite(player.duration)) return;
    player.currentTime = Math.min(
      player.duration,
      Math.max(0, player.currentTime + deltaSeconds),
    );
  }

  function handleMetadata() {
    clearLoadTimeout();
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

  const playerDuration = audioPlayerRef.current?.duration ?? 0;
  const playerCurrent = audioPlayerRef.current?.currentTime ?? 0;
  const progressPercent =
    playerDuration > 0 ? (playerCurrent / playerDuration) * 100 : 0;

  return (
    <div className="h-24 shrink-0 flex items-center justify-between gap-4 px-6 border-t border-border bg-surface/95 backdrop-blur-md">
      {/* Left — Now Playing */}
      <div className="flex items-center gap-3 w-[var(--width-panel)] min-w-0">
        {currentPlaying ? (
          <>
            <Artwork
              seed={currentPlaying.title}
              size={40}
              alt={currentPlaying.title}
              className="shadow-[0_0_18px_-4px_var(--accent)]"
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {currentPlaying.title}
              </p>
              <p className="text-xs text-muted truncate">
                {currentPlaying.artist}
              </p>
            </div>
          </>
        ) : (
          <div className="text-xs text-muted-faint">Nothing playing</div>
        )}
      </div>

      {/* Center — Controls + Progress */}
      <div className="flex flex-col items-center gap-2 flex-1 max-w-xl">
        {/* Buttons */}
        <div className="flex items-center gap-2">
          <IconButton label="Shuffle" onClick={queueContext.shuffleQueue}>
            <Shuffle className="w-4 h-4" />
          </IconButton>

          <IconButton label="Previous" onClick={handlePlayPrevious}>
            <SkipBack className="w-4 h-4" fill="currentColor" />
          </IconButton>

          <button
            onClick={handleTogglePlay}
            className="w-9 h-9 rounded-full bg-foreground hover:bg-foreground-soft text-background flex items-center justify-center transition-colors shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            title={playing ? "Pause" : "Play"}
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? (
              <Pause className="w-4 h-4" fill="currentColor" />
            ) : (
              <Play className="w-4 h-4" fill="currentColor" />
            )}
          </button>

          <IconButton label="Next" onClick={handlePlayNext}>
            <SkipForward className="w-4 h-4" fill="currentColor" />
          </IconButton>

          <IconButton
            label="Repeat"
            active={queueContext.repeating}
            onClick={() => queueContext.toggleRepeat()}
          >
            <Repeat className="w-4 h-4" />
          </IconButton>
        </div>

        {/* Progress bar */}
        <div className="w-full flex items-center gap-2">
          <span className="text-xs tabular-nums text-muted w-10 text-right">
            {currentTime}
          </span>
          <div
            role="slider"
            tabIndex={0}
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progressPercent)}
            aria-valuetext={`${currentTime} of ${totalDuration}`}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") {
                e.preventDefault();
                seekBy(5);
              } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                seekBy(-5);
              } else if (e.key === "Home") {
                e.preventDefault();
                seekToFraction(0);
              } else if (e.key === "End") {
                e.preventDefault();
                seekToFraction(1);
              }
            }}
            className="relative flex-1 h-1 bg-surface-3 rounded-full group cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              seekToFraction((e.clientX - rect.left) / rect.width);
            }}
          >
            <div
              className="absolute inset-y-0 left-0 bg-foreground group-hover:bg-accent rounded-full transition-colors"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs tabular-nums text-muted w-10">
            {totalDuration}
          </span>
        </div>

        {currentPlaying && (
          <audio
            key={currentPlaying.id}
            ref={audioPlayerRef}
            onPlay={() => {
              setPlaying(true);
              clearLoadTimeout();
            }}
            onPause={() => setPlaying(false)}
            src={
              currentPlaying.local
                ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/${currentPlaying.source}`
                : (currentPlaying.source ?? undefined)
            }
            onEnded={handleAudioEnd}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleMetadata}
            onError={() => skipCurrent()}
            autoPlay
          />
        )}
      </div>

      {/* Right — Volume */}
      <div className="flex items-center gap-2 w-[var(--width-panel)] justify-end">
        <IconButton
          label={muted ? "Unmute" : "Mute"}
          onClick={() => {
            const player = audioPlayerRef.current;
            if (player) {
              player.muted = !player.muted;
              setMuted(player.muted);
            }
          }}
        >
          {muted ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </IconButton>
        <Slider
          min={0}
          max={1}
          step={0.01}
          defaultValue={1}
          onChange={(e) => {
            if (audioPlayerRef.current)
              audioPlayerRef.current.volume = parseFloat(e.target.value);
          }}
          className="w-24 accent-foreground"
        />
      </div>
    </div>
  );
}
