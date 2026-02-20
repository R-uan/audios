import { IAudio, IUpdateAudio } from "../models/IAudio";

export class AudioRequest {
  public static async All() {}

  public static async OneView(id: string) {}

  public static async OneFull(id: string) {}

  public static async UpdateAudio(id: string, body: IUpdateAudio) {
    console.log(body);
    const request = await fetch(`http://localhost:5123/api/audio/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await request.json();
    console.log(response);
  }
}
