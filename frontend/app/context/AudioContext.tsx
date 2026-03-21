import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { IAudio, IPostAudio, IUpdateAudio } from "../models/IAudio";
import { AudioRequest } from "../shared/AudioRequests";
import { isRequestError } from "../shared/shared";
import { useNoticeContext } from "./NoticeContext";

interface AudioContextType {
  fetching: boolean;
  audios: IAudio[];
  deleteAudio: (id: string) => Promise<void>;
  addNewAudio: (audio: IPostAudio) => Promise<void>;
  updateAudio: (id: string, audio: IUpdateAudio) => Promise<void>;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioContextProvider({ children }: { children: ReactNode }) {
  const noticeContext = useNoticeContext();
  const [fetching, setFetching] = useState(false);
  const [audios, setAudios] = useState<IAudio[]>([]);

  async function updateAudio(id: string, updated: IUpdateAudio) {
    const response = await AudioRequest.UpdateAudio(id, updated);
    if (isRequestError(response)) {
      noticeContext.sendNotice({
        id,
        success: false,
        message: response.message,
        title: "Update Audio Request",
        source: "AudioContextProvider",
      });
    } else {
      setAudios((prev) =>
        prev.map((a) => (a.id === response.id ? response : a)),
      );
      noticeContext.sendNotice({
        id,
        success: true,
        title: "Update Audio Request",
        source: "AudioContextProvider",
        message: `Audio Sucessfully Updated.`,
      });
    }
  }

  async function deleteAudio(id: string) {
    const response = await AudioRequest.DeleteAudio(id);
    if (isRequestError(response)) {
      noticeContext.sendNotice({
        id,
        success: false,
        message: response.message,
        title: "Delete Audio Request",
        source: "AudioContextProvider",
      });
    } else {
      setAudios((prev) => prev.filter((a) => a.id != id));
      noticeContext.sendNotice({
        id,
        success: true,
        title: "Update Audio Request",
        source: "AudioContextProvider",
        message: `Audio Sucessfully Deleted.`,
      });
    }
  }

  async function addNewAudio(newAudio: IPostAudio) {
    const response = await AudioRequest.PostAudio(newAudio);
    if (isRequestError(response)) {
      noticeContext.sendNotice({
        id: `create-new-audio-${Math.random()}`,
        success: false,
        message: response.message,
        title: "Create Audio Request",
        source: "AudioContextProvider",
      });
    } else {
      setAudios([...audios, response]);
      noticeContext.sendNotice({
        id: `create-new-audio-${Math.random()}`,
        success: true,
        title: "Add Audio Request",
        source: "AudioContextProvider",
        message: `Audio Sucessfully Created.`,
      });
    }
  }

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
        addNewAudio,
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
