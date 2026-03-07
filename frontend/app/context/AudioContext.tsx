import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { IAudio } from "../models/IAudio";
import { AudioRequest } from "../shared/AudioRequests";

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

  const addAudio = (audio: IAudio) => {
    setAudios([...audios, audio]);
  };

  useEffect(() => {
    setFetching(true);
    AudioRequest.All()
      .then((audios) => {
        if (audios) setAudios(audios);
      })
      .finally(() => {
        setFetching(false);
      });
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
