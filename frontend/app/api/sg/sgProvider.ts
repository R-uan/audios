import axios from "axios";
import * as cheerio from "cheerio";

export default async function extractSgAudioInfo(url: string) {
  const html = (await axios.get(url)).data;
  const artist = getPerformer(url);
  const source = getSource(html);
  const title = cheerio.load(html)(".jp-title").text();
  return { title, artist, url, source };
}

function getPerformer(url: string): string {
  const performer = url.split("/u/")[1]?.split("/")[0];
  if (!performer) throw new Error("Invalid URL: performer not found");
  return performer;
}

function getSource(html: any) {
  const reg = new RegExp("(?<=sounds/)(.*)(?=.m4a)", "gmi");
  const audioId = cheerio.load(html)("script").text().match(reg);
  if (audioId === null) throw new Error("Invalid URL: AudioId not found.");
  return `https://media.soundgasm.net/sounds/${audioId[0]}.m4a`;
}
