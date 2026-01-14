export interface IPlaylist {
  id: string;
  name: string;
  createdAt: number;
  audios: IPlaylistAudio[];
}

interface IPlaylistAudio {
  playlistId: string;
  audioId: string;
}
