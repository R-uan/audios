import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { IPlaylist } from "../models/IPlaylist";
import { useNoticeContext } from "./NoticeContext";
import { PlaylistRequests } from "../shared/PlaylistRequests";
import { isRequestError } from "../shared/shared";

interface PlaylistContextType {
  playlists: Map<string, IPlaylist>;
  currentPlaylist: IPlaylist | null;
  removePlaylist: (id: string) => Promise<void>;
  setCurrentPlaylist: (id: string | null) => void;
  createPlaylist: (data: { name: string; audios: string[] | null }) => void;
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(
  undefined,
);

export function PlaylistContextProvider({ children }: { children: ReactNode }) {
  const noticeContext = useNoticeContext();
  const [processing, setProcessing] = useState(false);
  const [currentPlaylist, setCurrent] = useState<IPlaylist | null>(null);
  const [playlists, setPlaylists] = useState<Map<string, IPlaylist>>(new Map());

  async function createPlaylist(data: {
    name: string;
    audios: string[] | null;
  }) {
    if (processing) return;

    const response = await PlaylistRequests.PostPlaylist(data);
    if (isRequestError(response)) {
      noticeContext.sendNotice({
        id: `create-playlist-${data.name}`,
        success: false,
        title: "Creating Playlist",
        source: "CreatePlaylistForm",
        message: `Could not create playlist "${data.name}": ${response.statusCode}`,
      });
    } else {
      const newPlaylistMap = playlists;
      newPlaylistMap.set(response.id, response);
      setPlaylists(newPlaylistMap);

      noticeContext.sendNotice({
        id: response.id,
        success: true,
        title: "Creating Playlist",
        source: "CreatePlaylistForm",
        message: `Playlist "${response.name}" created with ${response.audios.length} audios.`,
      });
    }
  }

  async function removePlaylist(id: string) {
    const response = await PlaylistRequests.DeletePlaylist(id);
    if (isRequestError(response)) {
      noticeContext.sendNotice({
        id: `create-playlist-${id}`,
        success: false,
        title: "Deleting Playlist",
        source: "PlaylistContentProvider",
        message: `Could not delete playlist: ${response.statusCode}`,
      });
    } else {
      const newPlaylistMap = playlists;
      newPlaylistMap.delete(id);
      setPlaylists(newPlaylistMap);

      noticeContext.sendNotice({
        id: `create-playlist-${id}`,
        success: true,
        title: "Delete Playlist",
        source: "PlaylistContextProvider",
        message: `Playlist Deleted`,
      });
    }
  }

  function setCurrentPlaylist(id: string | null) {
    if (id != null) {
      const playlist = playlists.get(id);
      if (playlist) setCurrent(playlist);
    } else setCurrent(null);
  }

  useEffect(() => {
    async function fetchPlaylists() {
      try {
        setProcessing(true);
        const response = await PlaylistRequests.GetPlaylists();
        if (response == null) {
          noticeContext.sendNotice({
            id: "initial-playlist-fetch",
            title: "Playlist Request Failed.",
            source: "PlaylistContextProvider",
            message: "Could not fetch playlists.",
            success: false,
          });
        } else {
          const tempMap = new Map<string, IPlaylist>();
          response.forEach((p) => tempMap.set(p.id, p));

          noticeContext.sendNotice({
            id: "initial-playlist-fetch",
            title: "Playlist Request.",
            source: "PlaylistContextProvider",
            message: `Fetched ${response.length} playlists.`,
            success: true,
          });
          setPlaylists(tempMap);
        }
      } finally {
        setProcessing(false);
      }
    }

    fetchPlaylists();
  }, []);

  return (
    <PlaylistContext.Provider
      value={{
        playlists,
        currentPlaylist,
        setCurrentPlaylist,
        removePlaylist,
        createPlaylist,
      }}
    >
      {children}
    </PlaylistContext.Provider>
  );
}

export function usePlaylistContext() {
  const context = useContext(PlaylistContext);
  if (context == undefined)
    throw new Error("PlaylistContext used outside of provider.");
  return context;
}
