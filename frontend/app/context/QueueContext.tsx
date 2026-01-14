import { createContext, ReactNode, useContext, useState } from "react";
import { IAudio } from "../models/IAudio";

interface QueueContextType {
  queue: IAudio[]; // Ids from the audios in the queue.
  queueAudio: (audio: IAudio) => void;
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);

export function QueueContextProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<IAudio[]>([]);

  const queueAudio = (audio: IAudio) => {
    const newQueue = [...queue, audio];
    setQueue(newQueue);
  };

  return (
    <QueueContext.Provider value={{ queue, queueAudio }}>
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
