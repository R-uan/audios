import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { IAudio } from "../models/IAudio.js";

interface PlayerContextType {
  currentAudio: IAudio | null;
  playAudio: (audio: IAudio) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);
export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentAudio, setCurrentAudio] = useState<IAudio | null>(null);

  useEffect(() => {
    const storedAudio = localStorage.getItem("currentAudio");
    if (storedAudio != null) {
      const audioObject: IAudio = JSON.parse(storedAudio);
      setCurrentAudio(audioObject);
    }
  }, []);

  function playAudio(audio: IAudio) {
    localStorage.setItem("currentAudio", JSON.stringify(audio));
    setCurrentAudio(audio);
  }

  return (
    <PlayerContext.Provider value={{ currentAudio, playAudio }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayerContext() {
  const context = useContext(PlayerContext);
  if (!context) throw new Error("Error");
  return context;
}
