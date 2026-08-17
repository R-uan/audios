import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { IPostAudio } from "@/app/models/IAudio";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Field, Required } from "../ui/Form";
import { TagInput } from "../ui/TagInput";
import { useAudioContext } from "@/app/context/AudioContext";
import { getAudioDuration } from "@/app/helpers/getAudioDuration";

interface AddAudioForm {
  title: string;
  artist: string;
  link: string;
  source: string;
  local: boolean;
  releaseYear: string;
  genre: string;
  tags: string[];
}

const defaultForm: AddAudioForm = {
  title: "",
  artist: "",
  link: "",
  source: "",
  local: false,
  releaseYear: "",
  genre: "",
  tags: [],
};

export function CreateAudioForm() {
  const audioContext = useAudioContext();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<AddAudioForm>(defaultForm);

  const isValid = form.title.trim() && form.artist.trim() && form.source.trim();

  function set<K extends keyof AddAudioForm>(key: K, value: AddAudioForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleClose() {
    setIsOpen(false);
    setForm(defaultForm);
  }

  async function handleSubmit() {
    if (!isValid) return;

    // Snapshot form state before any await — prevents stale closure issues
    const snapshot = { ...form };

    const newAudio: IPostAudio = {
      tags: snapshot.tags,
      local: snapshot.local,
      title: snapshot.title.trim(),
      artist: snapshot.artist.trim(),
      source: snapshot.source.trim(),
      link: snapshot.link.trim() || null,
      genre: snapshot.genre.trim() || null,
      duration: await getAudioDuration(snapshot.source.trim()),
      releaseYear: snapshot.releaseYear ? parseInt(snapshot.releaseYear) : null,
    };

    await audioContext.addNewAudio(newAudio);
    setIsOpen(false);
    setForm(defaultForm);
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-foreground-soft hover:text-foreground hover:bg-surface-2 rounded-md transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Audio
      </button>
      {isOpen && (
        <Modal isOpen onClose={handleClose} ariaLabel="Add Audio">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">
                Add Audio
              </h2>
              <button
                onClick={handleClose}
                aria-label="Close"
                className="p-1 rounded-md text-muted hover:text-foreground hover:bg-surface-2 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <hr className="border-border" />

            {/* Required fields */}
            <div className="space-y-3">
              <Field
                label={
                  <>
                    Title <Required />
                  </>
                }
              >
                <Input
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="Track title"
                />
              </Field>
              <Field
                label={
                  <>
                    Artist <Required />
                  </>
                }
              >
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
              <Field
                label={
                  <>
                    Source <Required />
                  </>
                }
              >
                <Input
                  value={form.source}
                  onChange={(e) => set("source", e.target.value)}
                  placeholder="Audio source URL or path"
                />
              </Field>

              {/* Local toggle */}
              <div className="flex items-center justify-between px-3 py-2.5 rounded-md bg-surface-2 border border-border-strong">
                <div className="flex flex-col">
                  <span className="text-sm text-foreground-soft">
                    Local file
                  </span>
                  <span className="text-xs text-muted-faint">
                    Source is a local path
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.local}
                  aria-label="Local file"
                  onClick={() =>
                    setForm((prev) => ({ ...prev, local: !prev.local }))
                  }
                  className={`relative w-9 h-5 rounded-full transition-colors ${form.local ? "bg-accent" : "bg-surface-3"}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.local ? "translate-x-4" : "translate-x-0"}`}
                  />
                </button>
              </div>
            </div>

            <hr className="border-border" />

            {/* Optional metadata */}
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-widest text-muted-faint">
                Metadata
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Release Year">
                  <Input
                    type="number"
                    value={form.releaseYear}
                    onChange={(e) => set("releaseYear", e.target.value)}
                    placeholder="2024"
                  />
                </Field>
                <Field label="Genre">
                  <Input
                    value={form.genre}
                    onChange={(e) => set("genre", e.target.value)}
                    placeholder="e.g. Jazz"
                  />
                </Field>
              </div>
              <Field label="Tags">
                <TagInput
                  tags={form.tags}
                  onAdd={(t) => set("tags", [...form.tags, t])}
                  onRemove={(t) =>
                    set(
                      "tags",
                      form.tags.filter((x) => x !== t),
                    )
                  }
                />
                <p className="mt-1 text-xs text-muted-faint">
                  Enter to add · Backspace to remove last
                </p>
              </Field>
            </div>

            <div className="flex gap-3 pt-1">
              <Button variant="secondary" className="flex-1" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleSubmit}
                disabled={!isValid}
              >
                Add
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
