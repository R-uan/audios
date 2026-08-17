import { IPlaylist } from "../models/IPlaylist";
import { IRequestError } from "../models/IRequestError";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export class PlaylistRequests {
  public static async GetPlaylists(): Promise<IPlaylist[] | null> {
    const request = await fetch(`${API_URL}/playlist`);
    if (!request.ok) return null;
    const playlists: { data: IPlaylist[]; count: number } =
      await request.json();
    return playlists.data;
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
    const request = await fetch(`${API_URL}/playlist`, {
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
