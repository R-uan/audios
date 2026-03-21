import { IAudio, IPostAudio, IUpdateAudio } from "../models/IAudio";
import { IRequestError } from "../models/IRequestError";

const API_URL = "http://localhost:5123/api";

export class AudioRequest {
  public static async All(): Promise<IAudio[] | null> {
    const request = await fetch(`${API_URL}/audio`);
    if (!request.ok) return null;
    const response: { data: IAudio[] } = await request.json();
    return response.data;
  }

  public static async PostAudio(
    audio: IPostAudio,
  ): Promise<IAudio | IRequestError> {
    const request = await fetch(`${API_URL}/audio`, {
      method: "POST",
      body: JSON.stringify(audio),
      headers: { "Content-Type": "application/json" },
    });
    if (request.ok) {
      const response: IAudio = await request.json();
      return response;
    } else {
      const error: IRequestError = await request.json();
      return error;
    }
  }

  public static async UpdateAudio(
    id: string,
    body: IUpdateAudio,
  ): Promise<IAudio | IRequestError> {
    const request = await fetch(`${API_URL}/audio/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
    if (request.ok) {
      const response: IAudio = await request.json();
      return response;
    } else {
      const error: IRequestError = await request.json();
      return error;
    }
  }

  public static async DeleteAudio(
    id: string,
  ): Promise<{ deleted: string } | IRequestError> {
    const request = await fetch(`${API_URL}/audio/${id}`, {
      method: "DELETE",
    });
    if (request.ok) {
      const response: { deleted: string } = await request.json();
      return response;
    } else {
      const error: IRequestError = await request.json();
      return error;
    }
  }
}
