import { useMemo, useState } from "react";
import { useAudioContext } from "../context/AudioContext";
import { useQueueContext } from "../context/QueueContext";
import { usePlaylistContext } from "../context/PlaylistContext";
import { useFilterContext, SortBy } from "../context/AudioFilterContext";
import { useContextMenu } from "../components/ContextMenu";
import { IAudio, IUpdateAudio } from "../models/IAudio";

function compareBy(
  sortBy: Exclude<SortBy, "default">,
  dir: number,
): (a: IAudio, b: IAudio) => number {
  switch (sortBy) {
    case "title":
      return (a, b) => dir * a.title.localeCompare(b.title);
    case "artist":
      return (a, b) => dir * a.artist.localeCompare(b.artist);
    case "addedAt":
      return (a, b) =>
        dir * (new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime());
    case "duration":
      return (a, b) =>
        dir * ((a.metadata.duration ?? 0) - (b.metadata.duration ?? 0));
  }
}

export function useAudioCatalog() {
  const audioContext = useAudioContext();
  const queueContext = useQueueContext();
  const playlistContext = usePlaylistContext();
  const { filters, set } = useFilterContext();

  const [editingAudio, setEditingAudio] = useState<IAudio | null>(null);

  const { handleRightClick, contextMenu, ContextMenu, closeContextMenu } =
    useContextMenu<IAudio>("audio_catalog");

  const currentPlaylist = playlistContext.currentPlaylist;

  const audiosToRender = useMemo(() => {
    const list =
      currentPlaylist == null
        ? audioContext.audios
        : currentPlaylist.audios != null
          ? (currentPlaylist.audios
              .map((id) => audioContext.audios.find((a) => a.id === id))
              .filter(Boolean) as IAudio[])
          : null;

    if (!list) return null;

    const cutoff =
      filters.hoursAgo !== null
        ? filters.hoursAgo === 0
          ? new Date(new Date().setMinutes(0, 0, 0))
          : new Date(Date.now() - filters.hoursAgo * 3_600_000)
        : null;

    const search = filters.search.trim().toLowerCase();

    const filtered = list.filter((a) => {
      if (search) {
        const haystack = [a.title, a.artist, ...a.metadata.tags]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      if (
        filters.name &&
        !a.title.toLowerCase().includes(filters.name.toLowerCase())
      )
        return false;
      if (
        filters.artist &&
        !a.artist.toLowerCase().includes(filters.artist.toLowerCase())
      )
        return false;
      if (
        filters.includeTags.length > 0 &&
        !filters.includeTags.every((t) => a.metadata.tags.includes(t))
      )
        return false;
      if (
        filters.excludeTags.length > 0 &&
        filters.excludeTags.some((t) => a.metadata.tags.includes(t))
      )
        return false;
      if (cutoff) {
        const updated = a.updatedAt ? new Date(a.updatedAt) : new Date(a.addedAt);
        if (updated < cutoff) return false;
      }
      return true;
    });

    if (filters.sortBy === "default") return filtered;

    const dir = filters.sortDir === "asc" ? 1 : -1;
    return [...filtered].sort(compareBy(filters.sortBy, dir));
  }, [audioContext.audios, currentPlaylist, filters]);

  function handlePlayAudio() {
    if (contextMenu?.data) queueContext.playNow(contextMenu.data);
    closeContextMenu();
  }

  function handleQueueAudio() {
    if (contextMenu?.data) queueContext.queueAudio(contextMenu.data);
    closeContextMenu();
  }

  function handleEditAudio() {
    if (contextMenu?.data) setEditingAudio(contextMenu.data);
    closeContextMenu();
  }

  function handleSeeMoreOfArtist() {
    if (contextMenu?.data) set("artist", contextMenu.data.artist);
    closeContextMenu();
  }

  async function handleUpdateAudio(
    audio: IAudio,
    add: string[],
    remove: string[],
  ) {
    const update: IUpdateAudio = {
      title: audio.title,
      duration: audio.metadata.duration,
      artist: audio.artist,
      genre: audio.metadata.genre,
      link: audio.link,
      mood: audio.metadata.mood,
      releaseYear: audio.metadata.releaseYear,
      source: audio.source,
      addTags: add,
      removeTags: remove,
    };

    await audioContext.updateAudio(audio.id, update);
    setEditingAudio(null);
  }

  async function handleDeleteAudio(id: string) {
    await audioContext.deleteAudio(id);
    closeContextMenu();
  }

  function queueRenderedAudios() {
    if (audiosToRender != null && audiosToRender.length > 0)
      queueContext.queueAudio(audiosToRender);
  }

  function playAudio(audio: IAudio) {
    queueContext.playNow(audio);
  }

  function queueAudio(audio: IAudio) {
    queueContext.queueAudio(audio);
  }

  return {
    currentPlaylist,
    audiosToRender,
    fetching: audioContext.fetching,
    editingAudio,
    setEditingAudio,
    contextMenu,
    ContextMenu,
    handleRightClick,
    closeContextMenu,
    handlePlayAudio,
    handleQueueAudio,
    handleEditAudio,
    handleUpdateAudio,
    handleDeleteAudio,
    handleSeeMoreOfArtist,
    queueRenderedAudios,
    playAudio,
    queueAudio,
  };
}
