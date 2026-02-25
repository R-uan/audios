import { IAudio, IPostAudio, IUpdateAudio } from "../models/IAudio";

export class AudioRequest {
  public static async All() {}

  public static async OneView(id: string) {}

  public static async OneFull(id: string) {}

  public static async AddAudio(audio: IPostAudio) {
    try {
      const request = await fetch("http://localhost:5123/api/audio", {
        method: "POST",
        body: JSON.stringify(audio),
        headers: { "Content-Type": "application/json" },
      });

      if (request.ok) {
        const response: IAudio = await request.json();
        return response;
      }
      return null;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

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
