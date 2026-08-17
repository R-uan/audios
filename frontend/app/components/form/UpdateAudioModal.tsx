import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { IAudio } from "@/app/models/IAudio";
import { Modal } from "@/app/components/ui/Modal";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Field } from "../ui/Form";
import { TagInput } from "../ui/TagInput";

interface UpdateAudioFormProps {
  audio: IAudio;
  onClose: () => void;
  onSave: (updated: IAudio, add: string[], remove: string[]) => void;
}

export function UpdateAudioForm({
  audio,
  onClose,
  onSave,
}: UpdateAudioFormProps) {
  const [form, setForm] = useState<IAudio>(audio);
  const [addTags, setAddTags] = useState<string[]>([]);
  const [removeTags, setRemovedTags] = useState<string[]>([]);

  useEffect(() => {
    setForm(audio);
  }, [audio]);

  const set = <K extends keyof IAudio>(key: K, value: IAudio[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const setMeta = <K extends keyof IAudio["metadata"]>(
    key: K,
    value: IAudio["metadata"][K],
  ) =>
    setForm((prev) => ({
      ...prev,
      metadata: { ...prev.metadata, [key]: value },
    }));

  const handleAddTag = (tag: string) => {
    setMeta("tags", [...form.metadata.tags, tag]);
    if (removeTags.includes(tag)) {
      setRemovedTags(removeTags.filter((t) => t !== tag)); // un-mark for removal
    } else {
      setAddTags([...addTags, tag]);
    }
  };

  const handleRemoveTag = (tag: string) => {
    setMeta(
      "tags",
      form.metadata.tags.filter((t) => t !== tag),
    );
    if (addTags.includes(tag)) {
      setAddTags(addTags.filter((t) => t !== tag)); // undo the addition
    } else {
      setRemovedTags([...removeTags, tag]);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} ariaLabel="Edit Audio">
      <div className="space-y-5">
        {/* Modal title */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Edit Audio</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-md text-muted hover:text-foreground hover:bg-surface-2 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <hr className="border-border" />

        {/* Core fields */}
        <div className="space-y-3">
          <Field label="Title">
            <Input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Track title"
            />
          </Field>

          <Field label="Artist">
            <Input
              value={form.artist}
              onChange={(e) => set("artist", e.target.value)}
              placeholder="Artist name"
            />
          </Field>

          <Field label="Link">
            <Input
              value={form.link}
              onChange={(e) => set("link", e.target.value)}
              placeholder="https://..."
            />
          </Field>
          <Field label="Source">
            <Input
              value={form.source}
              onChange={(e) => set("source", e.target.value)}
              placeholder="Audio source URL or path"
            />
          </Field>
        </div>

        <hr className="border-border" />

        {/* Metadata */}
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-faint">
            Metadata
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Release Year">
              <Input
                type="number"
                value={form.metadata.releaseYear ?? ""}
                onChange={(e) =>
                  setMeta(
                    "releaseYear",
                    e.target.value ? parseInt(e.target.value) : null,
                  )
                }
                placeholder="2024"
              />
            </Field>

            <Field label="Genre">
              <Input
                value={form.metadata.genre ?? ""}
                onChange={(e) => setMeta("genre", e.target.value || null)}
                placeholder="e.g. Jazz"
              />
            </Field>
          </div>

          {/* Tags */}
          <Field label="Tags">
            <TagInput
              tags={form.metadata.tags}
              onAdd={handleAddTag}
              onRemove={handleRemoveTag}
            />
            <p className="mt-1 text-xs text-muted-faint">
              Enter to add · Backspace to remove last
            </p>
          </Field>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={() => {
              onSave(form, addTags, removeTags);
              onClose();
            }}
            disabled={!form.title.trim()}
          >
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
}
