import { useMemo, useState } from "react";
import { useAudioContext } from "../context/AudioContext";
import { useQueueContext } from "../context/QueueContext";
import { usePlaylistContext } from "../context/PlaylistContext";
import { useFilters } from "../context/AudioFilterContext";
import { useContextMenu } from "../components/ContextMenu";
import { AudioRequest } from "../shared/AudioRequests";
import { IAudio, IUpdateAudio } from "../models/IAudio";

export function useAudioCatalog() {
  const audioContext = useAudioContext();
  const queueContext = useQueueContext();
  const playlistContext = usePlaylistContext();
  const { filters } = useFilters();

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
      return true;
    });
  }, [audioContext.audios, currentPlaylist, filters]);

  const handlePlayAudio = () => {
    if (contextMenu?.data) queueContext.playNow(contextMenu.data);
    closeContextMenu();
  };

  const handleQueueAudio = () => {
    if (contextMenu?.data) queueContext.queueAudio(contextMenu.data);
    closeContextMenu();
  };

  const handleEditAudio = () => {
    if (contextMenu?.data) setEditingAudio(contextMenu.data);
    closeContextMenu();
  };

  const handleUpdateAudio = async (
    audio: IAudio,
    add: string[],
    remove: string[],
  ) => {
    const update: IUpdateAudio = {
      title: audio.title,
      duration: audio.metadata.duration,
      artist: audio.artist,
      genrer: audio.metadata.genrer,
      link: audio.link,
      mood: audio.metadata.mood,
      releaseYear: audio.metadata.releaseYear,
      source: audio.source,
      addTags: add,
      removeTags: remove,
    };

    const newAudio = await AudioRequest.UpdateAudio(audio.id, update);
    if (newAudio != null) audioContext.updateAudio(newAudio);
    setEditingAudio(null);
  };

  const handleDeleteAudio = async () => {
    if (contextMenu != null) {
      if (await AudioRequest.DeleteAudio(contextMenu.data.id))
        audioContext.deleteAudio(contextMenu.data.id);
    }
    closeContextMenu();
  };

  const queueRenderedAudios = () => {
    if (audiosToRender != null && audiosToRender.length > 0)
      queueContext.queueAudio(audiosToRender);
  };

  // useAudioCatalog.ts
  return {
    currentPlaylist,
    audiosToRender,
    editingAudio,
    setEditingAudio,
    contextMenu,
    ContextMenu,
    handleRightClick,
    closeContextMenu, // 👈
    handlePlayAudio,
    handleQueueAudio,
    handleEditAudio,
    handleUpdateAudio,
    handleDeleteAudio,
    queueRenderedAudios,
  };
}
