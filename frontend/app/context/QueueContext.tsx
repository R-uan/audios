import { createContext, ReactNode, useContext, useState } from "react";
import { IAudio } from "../models/IAudio";
import { IPlaylist } from "../models/IPlaylist";
import { useAudioContext } from "./AudioContext";

interface QueueContextType {
  queue: IAudio[];
  queuePointer: number;

  playNext: () => void;
  clearQueue: () => void;
  playPrevious: () => void;
  toggleRepeat: () => void;
  playNow: (audio: IAudio) => void;

  queuePlaylist: (playlist: IPlaylist) => void;
  queueAudio: (audio: IAudio | IAudio[]) => void;
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);

export function QueueContextProvider({ children }: { children: ReactNode }) {
  const audioContext = useAudioContext();
  const [repeat, setRepeat] = useState(false);
  const [queuePointer, setPointer] = useState(-1);
  const [queue, setQueue] = useState<IAudio[]>([]);

  function toggleRepeat() {
    setRepeat(!repeat);
  }

  function clearQueue() {
    setQueue([]);
  }

  function playNow(audio: IAudio) {
    if (queue.length == 0) {
      setQueue([audio]);
      setPointer(0);
    } else {
      let newQueue = [
        ...queue.slice(0, queuePointer + 1),
        audio,
        ...queue.slice(queuePointer + 1),
      ];
      setQueue(newQueue);
      setTimeout(() => playNext(), 100);
    }
  }

  function queueAudio(audio: IAudio | IAudio[]) {
    const first = queue.length == 0;
    setQueue([...queue, ...(Array.isArray(audio) ? audio : [audio])]);
    if (first) setPointer(0);
  }

  function queuePlaylist(playlist: IPlaylist) {
    const audios = audioContext.audios.filter((a) =>
      playlist.audios.includes(a.id),
    );
    queueAudio(audios);
  }

  function playNext() {
    if (queuePointer == queue.length - 1) {
      if (repeat) setPointer(0);
      return;
    }
    setPointer(queuePointer + 1);
  }

  function playPrevious() {
    if (queuePointer == 0) return;
    setPointer(queuePointer - 1);
  }

  return (
    <QueueContext.Provider
      value={{
        queue,
        toggleRepeat,
        clearQueue,
        queuePlaylist,
        queueAudio,
        queuePointer,
        playNow,
        playNext,
        playPrevious,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
}

export function useQueueContext() {
  const context = useContext(QueueContext);
  if (context == undefined)
    throw new Error("Queue context not used inside provider");
  return context;
}
