import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { IAudio } from "../models/IAudio";

interface AudioContextType {
  fetching: boolean;
  audios: IAudio[];
  addAudio: (audio: IAudio) => void;
  deleteAudio: (id: string) => void;
  updateAudio: (audio: IAudio) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioContextProvider({ children }: { children: ReactNode }) {
  const [fetching, setFetching] = useState(false);
  const [audios, setAudios] = useState<IAudio[]>([]);

  const updateAudio = (updated: IAudio) => {
    setAudios((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  };

  const deleteAudio = (id: string) => {
    setAudios((prev) => prev.filter((a) => a.id != id));
  };

  const addAudio = (audio: IAudio) => {};

  useEffect(() => {
    async function fetchData() {
      try {
        setFetching(true);
        const response = await fetch("http://localhost:5123/api/audio");
        if (!response.ok) {
          console.log("Could not fetch audio data.");
        }
        const data: { data: IAudio[] } = await response.json();
        console.log(`Fetched ${data.data.length} audios.`);
        setAudios(data.data);
      } finally {
        setFetching(false);
      }
    }
    fetchData();
  }, []);

  return (
    <AudioContext.Provider
      value={{
        audios,
        deleteAudio,
        addAudio,
        updateAudio,
        fetching,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudioContext() {
  const context = useContext(AudioContext);
  if (context == null) throw new Error("Audio context used outside provider");
  return context;
}
