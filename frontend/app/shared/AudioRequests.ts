import { IAudio, IUpdateAudio } from "../models/IAudio";

export class AudioRequest {
  public static async All() {}

  public static async OneView(id: string) {}

  public static async OneFull(id: string) {}

  public static async UpdateAudio(id: string, body: IUpdateAudio) {
    const request = await fetch(`http://localhost:5123/api/audio/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (request.ok) return await request.json();
    return null;
  }

  public static async DeleteAudio(id: string) {
    const request = await fetch(`http://localhost:5123/api/audio/${id}`, {
      method: "DELETE",
    });
    if (request.ok) return true;
    return false;
  }

  public static async UpdateDuration(id: string, duration: number) {}
}
