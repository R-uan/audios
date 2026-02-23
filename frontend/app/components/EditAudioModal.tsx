import { ReactNode, useEffect, useState } from "react";
import { IAudio } from "../models/IAudio";
import { Modal } from "./Modal";
interface EditAudioFormProps {
  audio: IAudio;
  onClose: () => void;
  onSave: (updated: IAudio, add: string[], remove: string[]) => void;
}
export function EditAudioModal({ audio, onClose, onSave }: EditAudioFormProps) {
  const [form, setForm] = useState<IAudio>(audio);
  const [tagInput, setTagInput] = useState("");
  const [addTags, setAddTags] = useState<string[]>([]);
  const [removeTags, setRemovedTags] = useState<string[]>([]);

  useEffect(() => {
    setForm(audio);
    setTagInput("");
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

  const handleAddTag = () => {
    const tag = tagInput.trim();

    if (!tag || form.metadata.tags.includes(tag)) return;

    setMeta("tags", [...form.metadata.tags, tag]);

    if (removeTags.includes(tag)) handleRemoveTag(tag);
    else setAddTags([...addTags, tag]);

    setTagInput("");
  };

  const handleRemoveTag = (tag: string) => {
    setMeta(
      "tags",
      form.metadata.tags.filter((t) => t !== tag),
    );

    if (addTags.includes(tag)) {
      setTagInput(tag);
      handleAddTag();
      return;
    }

    setRemovedTags([...removeTags, tag]);
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
    if (e.key === "Backspace" && !tagInput && form.metadata.tags.length > 0)
      handleRemoveTag(form.metadata.tags[form.metadata.tags.length - 1]);
  };

  return (
    <Modal isOpen={true} onClose={onClose}>
      <div className="space-y-5">
        {/* Modal title */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-100">Edit Audio</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <hr className="border-zinc-800" />

        {/* Core fields */}
        <div className="space-y-3">
          <Field label="Title">
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              className={inputCls}
              placeholder="Track title"
            />
          </Field>

          <Field label="Artist">
            <input
              value={form.artist}
              onChange={(e) => set("artist", e.target.value)}
              className={inputCls}
              placeholder="Artist name"
            />
          </Field>

          <Field label="Link">
            <input
              value={form.link}
              onChange={(e) => set("link", e.target.value)}
              className={inputCls}
              placeholder="https://..."
            />
          </Field>
        </div>

        <hr className="border-zinc-800" />

        {/* Metadata */}
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-600">
            Metadata
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Release Year">
              <input
                type="number"
                value={form.metadata.releaseYear ?? ""}
                onChange={(e) =>
                  setMeta(
                    "releaseYear",
                    e.target.value ? parseInt(e.target.value) : null,
                  )
                }
                className={inputCls}
                placeholder="2024"
              />
            </Field>

            <Field label="Genre">
              <input
                value={form.metadata.genrer ?? ""}
                onChange={(e) => setMeta("genrer", e.target.value || null)}
                className={inputCls}
                placeholder="e.g. Jazz"
              />
            </Field>

            <Field label="Mood">
              <input
                value={form.metadata.mood ?? ""}
                onChange={(e) => setMeta("mood", e.target.value || null)}
                className={inputCls}
                placeholder="e.g. Chill"
              />
            </Field>

            <Field label="Duration (s)">
              <input
                type="number"
                value={form.metadata.duration ?? ""}
                onChange={(e) =>
                  setMeta(
                    "duration",
                    e.target.value ? parseFloat(e.target.value) : null,
                  )
                }
                className={inputCls}
                placeholder="213"
              />
            </Field>
          </div>

          {/* Tags */}
          <Field label="Tags">
            <div className="flex flex-wrap gap-1.5 p-2 min-h-10 rounded-md bg-zinc-800 border border-zinc-700 focus-within:ring-1 focus-within:ring-purple-500 focus-within:border-transparent transition-all">
              {form.metadata.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 px-1.5 py-0.5 text-xs bg-zinc-700 border border-zinc-600 text-zinc-300 rounded"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="text-zinc-500 hover:text-red-400 transition-colors"
                  >
                    <svg
                      className="w-2.5 h-2.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                className="flex-1 min-w-20 bg-transparent text-xs text-zinc-200 placeholder-zinc-600 outline-none"
                placeholder={form.metadata.tags.length === 0 ? "Add tags…" : ""}
              />
            </div>
            <p className="mt-1 text-xs text-zinc-600">
              Enter to add · Backspace to remove last
            </p>
          </Field>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(form, addTags, removeTags);
              onClose();
            }}
            disabled={!form.title.trim()}
            className="flex-1 px-4 py-2 text-sm rounded-md bg-purple-600 text-white hover:bg-purple-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
}

// Helpers

const inputCls =
  "w-full px-3 py-2 text-sm rounded-md bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent transition-all";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs text-zinc-500">{label}</label>
      {children}
    </div>
  );
}
