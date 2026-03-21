import { IPlaylist } from "../models/IPlaylist";
import { IRequestError } from "../models/IRequestError";

const API_URL = "http://localhost:5123/api";

export class PlaylistRequests {
  public static async GetPlaylists(): Promise<IPlaylist[] | null> {
    const request = await fetch(`${API_URL}/playlist`);
    if (!request.ok) return null;
    const playlists: IPlaylist[] = await request.json();
    return playlists;
  }

  public static async DeletePlaylist(
    id: string,
  ): Promise<{ deleted: string } | IRequestError> {
    const request = await fetch(`${API_URL}/playlist/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (request.ok) {
      const response: { deleted: string } = await request.json();
      return response;
    } else {
      const error: IRequestError = await request.json();
      return error;
    }
  }

  public static async PostPlaylist(data: {
    name: string;
    audios: string[] | null;
  }): Promise<IPlaylist | IRequestError> {
    const request = await fetch("http://localhost:5123/api/playlist", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });

    if (request.ok) {
      const playlist: IPlaylist = await request.json();
      return playlist;
    } else {
      const error: IRequestError = await request.json();
      return error;
    }
  }
}
