import { createContext, ReactNode, useContext, useState } from "react";
import { IAudio } from "../models/IAudio";
import { IPlaylist } from "../models/IPlaylist";
import { useAudioContext } from "./AudioContext";

interface QueueContextType {
  queue: IAudio[]; // Ids from the audios in the queue.
  queueAudio: (audio: IAudio | IAudio[]) => void;
  queuePlaylist: (playlist: IPlaylist) => void;
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);

export function QueueContextProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<IAudio[]>([]);

  const queueAudio = (audio: IAudio | IAudio[]) => {
    const itemsToAdd = Array.isArray(audio) ? audio : [audio];
    setQueue([...queue, ...itemsToAdd]);
  };

  const audioContext = useAudioContext();
  const queuePlaylist = (playlist: IPlaylist) => {
    const audios = audioContext.audios.filter((a) =>
      playlist.audios.includes(a.id),
    );
    queueAudio(audios);
  };

  return (
    <QueueContext.Provider value={{ queue, queueAudio, queuePlaylist }}>
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
