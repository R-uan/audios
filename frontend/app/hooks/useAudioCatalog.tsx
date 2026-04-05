import { useMemo, useState } from "react";
import { useAudioContext } from "../context/AudioContext";
import { useQueueContext } from "../context/QueueContext";
import { usePlaylistContext } from "../context/PlaylistContext";
import { useFilterContext } from "../context/AudioFilterContext";
import { useContextMenu } from "../components/ContextMenu";
import { IAudio, IUpdateAudio } from "../models/IAudio";

export function useAudioCatalog() {
  const audioContext = useAudioContext();
  const queueContext = useQueueContext();
  const playlistContext = usePlaylistContext();
  const { filters } = useFilterContext();

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

    return list.filter((a) => {
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
      if (cutoff && new Date(a.addedAt) < cutoff) return false;
      return true;
    });
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

  return {
    currentPlaylist,
    audiosToRender,
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
    queueRenderedAudios,
  };
}
