import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { IAudio } from "../models/IAudio";
import { IPlaylist } from "../models/IPlaylist";
import { useAudioContext } from "./AudioContext";
import { useNoticeContext } from "./NoticeContext";

interface QueueContextType {
  queue: IAudio[];
  queuePointer: number;
  shuffleQueue: () => void;
  repeating: boolean;
  playNext: () => void;
  clearQueue: () => void;
  playPrevious: () => void;
  toggleRepeat: () => void;
  syncQueue: (updatedAudio: IAudio) =>void;
  playNow: (audio: IAudio) => void;
  setQueue: (queue: IAudio[]) => void;
  queuePlaylist: (playlist: IPlaylist) => void;
  queueAudio: (audio: IAudio | IAudio[]) => void;
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);

export function QueueContextProvider({ children }: { children: ReactNode }) {
  const audioContext = useAudioContext();
  const noticeContext = useNoticeContext();

  const [repeat, setRepeat] = useState(false);
  const [queuePointer, setPointer] = useState(-1);
  const [queue, setQueue] = useState<IAudio[]>([]);

  useEffect(() => {
    const queueString = localStorage.getItem("queuedAudios");
    if (queueString != null) {
      const audioObjects: IAudio[] = JSON.parse(queueString);
      queueAudio(audioObjects);
      // noticeContext.sendNotice({
      //   success: true,
      //   title: "Restoring Audio Queue",
      //   source: "QueueContextProvider",
      //   id: `queue-audio-${Math.random()}`,
      //   message: `Restored ${audioObjects.length} audio(s) to the queue.`,
      // });
    }
  }, []);

  function toggleRepeat() {
    setRepeat(!repeat);
  }

  function persistQueue(next: IAudio[]) {
    if (next.length === 0) localStorage.removeItem("queuedAudios");
    else localStorage.setItem("queuedAudios", JSON.stringify(next));
  }

  function shuffleQueue() {
    if (queue.length <= 1) return;

    const currentAudio = queue[queuePointer];
    const remaining = queue.filter((_, idx) => idx !== queuePointer);

    for (let i = remaining.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
    }

    const shuffled = [currentAudio, ...remaining];
    setQueue(shuffled);
    setPointer(0);
    persistQueue(shuffled);
  }

  function clearQueue() {
    setQueue([]);
    localStorage.removeItem("queuedAudios");
    setPointer(-1);
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
    const newItems = Array.isArray(audio) ? audio : [audio];

    const newQueue = [
      ...queue,
      ...newItems.filter((item) => !queue.some((q) => q.id === item.id)),
    ];

    setQueue(newQueue);
    persistQueue(newQueue);
    if (first) setPointer(0);
    noticeContext.sendNotice({
      success: true,
      title: "Queueing Audios",
      source: "QueueContextProvider",
      id: `queue-audio-${Math.random()}`,
      message: `Added ${newItems.length} audio(s) to the queue.`,
    });
  }

  function syncQueue(updatedAudio: IAudio) {
    setQueue((prev) =>
      prev.map((item) => (item.id === updatedAudio.id ? updatedAudio : item))
    );
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
      else {
        setPointer(-1);
        clearQueue();
      }
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
        syncQueue,
        setQueue, // Add this
        toggleRepeat,
        repeating: repeat,
        clearQueue,
        shuffleQueue,
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
    throw new Error("QueueContext used outside provider range.");
  return context;
}
