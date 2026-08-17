import { useState } from "react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
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
      <Input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Enter playlist name..."
        className="px-4 py-2 rounded-lg focus:ring-2"
      />
      <div className="flex items-center gap-2">
        <input
          id="queue-checkbox"
          type="checkbox"
          checked={isChecked}
          onChange={(e) => setIsChecked(e.target.checked)}
          className="w-4 h-4 rounded accent-accent cursor-pointer"
        />
        <label
          htmlFor="queue-checkbox"
          className="text-sm text-muted cursor-pointer select-none"
        >
          Add queue audios to the playlist
        </label>
      </div>
      <div className="flex gap-3 pt-2">
        <Button variant="secondary" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          className="flex-1"
          onClick={createEmptyPlaylist}
          disabled={!inputValue.trim()}
        >
          Create
        </Button>
      </div>
    </div>
  );
}
