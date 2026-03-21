import { useState } from "react";
import { useQueueContext } from "@/app/context/QueueContext";
import { usePlaylistContext } from "@/app/context/PlaylistContext";

interface CreatePlaylistFormProps {
  onClose: () => void;
}

export function CreatePlaylistForm({ onClose }: CreatePlaylistFormProps) {
  const queueContext = useQueueContext();
  const playlistContext = usePlaylistContext();

  const [inputValue, setInputValue] = useState("");
  const [isChecked, setIsChecked] = useState(false);

  async function createEmptyPlaylist() {
    const data: { name: string; audios: string[] | null } = {
      name: inputValue,
      audios: null,
    };

    if (isChecked) data.audios = queueContext.queue.map((a) => a.id);
    playlistContext.createPlaylist(data);
    setInputValue("");
    setIsChecked(false);
    onClose();
  }

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Enter playlist name..."
        className="w-full px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
      />
      <div className="flex items-center gap-2">
        <input
          id="queue-checkbox"
          type="checkbox"
          checked={isChecked}
          onChange={(e) => setIsChecked(e.target.checked)}
          className="w-4 h-4 rounded accent-purple-500 cursor-pointer"
        />
        <label
          htmlFor="queue-checkbox"
          className="text-sm text-zinc-400 cursor-pointer select-none"
        >
          Add queue audios to the playlist
        </label>
      </div>
      <div className="flex gap-3 pt-2">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 text-sm rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={createEmptyPlaylist}
          disabled={!inputValue.trim()}
          className="flex-1 px-4 py-2 text-sm rounded-md bg-purple-600 text-white hover:bg-purple-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Create
        </button>
      </div>
    </div>
  );
}
