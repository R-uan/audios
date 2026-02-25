export interface IAudio {
  id: string;
  title: string;
  artist: string;
  link: string;
  source: string;
  addedAt: string;
  metadata: {
    releaseYear: number | null;
    genrer: string | null;
    duration: number | null;
    mood: string | null;
    tags: string[];
  };
}

export interface IPostAudio {
  title: string;
  artist: string;
  link: string;
  source: string;
  local: boolean;
  releaseYear: number | null;
  genrer: string | null;
  duration: number | null;
  mood: string | null;
  tags: string[];
}

export interface IUpdateAudio {
  title: string;
  artist: string;
  link: string;
  source: string;
  releaseYear: number | null;
  genrer: string | null;
  duration: number | null;
  mood: string | null;
  addTags: string[];
  removeTags: string[];
}
