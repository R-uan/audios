import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { IPlaylist } from "../models/IPlaylist";

interface PlaylistContextType {
  addPlaylist: (playlist: IPlaylist) => void;
  playlists: Map<string, IPlaylist>;
  currentPlaylist: IPlaylist | null;
  removePlaylist: (id: string) => void;
  setCurrentPlaylist: (id: string | null) => void;
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(
  undefined,
);

export function PlaylistContextProvider({ children }: { children: ReactNode }) {
  const [playlists, setPlaylists] = useState<Map<string, IPlaylist>>(new Map());
  const [currentPlaylist, setCurrent] = useState<IPlaylist | null>(null);
  const [fetching, setFetching] = useState(false);

  const addPlaylist = (playlist: IPlaylist) => {
    const newMap = playlists;
    newMap.set(playlist.id, playlist);
    setPlaylists(newMap);
  };

  const removePlaylist = (id: string) => {
    const newMap = playlists;
    newMap.delete(id);
    setPlaylists(newMap);
  };

  const setCurrentPlaylist = (id: string | null) => {
    if (id != null) {
      const playlist = playlists.get(id);
      if (playlist) setCurrent(playlist);
    } else setCurrent(null);
  };

  useEffect(() => {
    async function fetchPlaylists() {
      try {
        setFetching(true);
        const response = await fetch("http://localhost:5123/api/playlist");
        if (!response.ok) console.log("Could not fetch audio data");
        const result: IPlaylist[] = await response.json();
        const tempMap = new Map<string, IPlaylist>();
        result.forEach((p) => tempMap.set(p.id, p));
        console.log(`fetched ${result.length} playlists`);
        setPlaylists(tempMap);
      } finally {
        setFetching(false);
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
        addPlaylist,
      }}
    >
      {children}
    </PlaylistContext.Provider>
  );
}

export function usePlaylistContext() {
  const context = useContext(PlaylistContext);
  if (context == undefined) throw new Error("yak playlist context");
  return context;
}
