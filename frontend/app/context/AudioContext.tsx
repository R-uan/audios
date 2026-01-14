import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { IAudio } from "../models/IAudio";

interface AudioContextType {
  audios: IAudio[];
  addAudio: (audio: IAudio) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioContextProvider({ children }: { children: ReactNode }) {
  const [fetching, setFetching] = useState(false);
  const [audios, setAudios] = useState<IAudio[]>([]);

  const addAudio = (audio: IAudio) => {};

  useEffect(() => {
    async function fetchData() {
      try {
        setFetching(true);
        const response = await fetch("http://localhost:5123/api/audio");
        if (!response.ok) {
          console.log("Could not fetch audio data.");
        }

        const audios: IAudio[] = await response.json();
        console.log(`Fetched ${audios.length} audios.`);
        setAudios(audios);
      } finally {
        setFetching(false);
      }
    }
    fetchData();
  }, []);

  return (
    <AudioContext.Provider value={{ audios, addAudio }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudioContext() {
  const context = useContext(AudioContext);
  if (context == null) throw new Error("Audio context used outside provider");
  return context;
}
