import extractSgAudioInfo from "./sgProvider";

export async function POST(req: Request) {
  try {
    const { url: url }: { url: string | null } = await req.json();
    if (url == null)
      return Response.json({ error: "audio url required" }, { status: 400 });
    console.log(url);
    const data = await extractSgAudioInfo(url);
    return Response.json(data, { status: 200 });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 500 });
  }
}
