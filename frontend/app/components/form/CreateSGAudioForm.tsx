import React, { useState } from "react";
import { Link2, X } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Field, Required } from "../ui/Form";
import { TagInput } from "../ui/TagInput";
import { IPostAudio } from "@/app/models/IAudio";
import { useAudioContext } from "@/app/context/AudioContext";
import { getAudioDuration } from "@/app/helpers/getAudioDuration";

interface SGForm {
  link: string;
  releaseYear: string;
  genre: string;
  tags: string[];
}

const defaultSGForm: SGForm = {
  link: "",
  releaseYear: "",
  genre: "",
  tags: [],
};

export function CreateSGAudioForm() {
  const audioContext = useAudioContext();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<SGForm>(defaultSGForm);

  const isFormValid = form.link.trim();

  function setSGForm<K extends keyof SGForm>(key: K, value: SGForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleClose() {
    setIsOpen(false);
    setForm(defaultSGForm);
  }

  async function handleSubmit() {
    if (!isFormValid) return;
    const request = await fetch("/api/sg", {
      method: "POST",
      body: JSON.stringify({ url: form.link.trim() }),
      headers: { "Content-Type": "application/json" },
    });

    if (request.ok) {
      const { title, artist, url, source } = await request.json();
      const duration = await getAudioDuration(source);

      const newAudio: IPostAudio = {
        title,
        artist,
        source,
        link: url,
        local: false,
        tags: form.tags,
        duration: duration,
        genre: form.genre,
        releaseYear: form.releaseYear ? parseInt(form.releaseYear) : null,
      };

      await audioContext.addNewAudio(newAudio);
      setIsOpen(false);
      setForm(defaultSGForm);
    }
  }
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-foreground-soft hover:text-foreground hover:bg-surface-2 rounded-md transition-colors"
      >
        <Link2 className="w-4 h-4" />
        Add SG Audio
      </button>
      {isOpen && (
        <Modal isOpen onClose={handleClose} ariaLabel="Add SG Audio">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">
                Add SG Audio
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

            <Field
              label={
                <>
                  Link <Required />
                </>
              }
            >
              <Input
                value={form.link}
                onChange={(e) => setSGForm("link", e.target.value)}
                placeholder="https://..."
                required
              />
            </Field>

            <hr className="border-border" />

            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-widest text-muted-faint">
                Metadata
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Release Year">
                  <Input
                    type="number"
                    value={form.releaseYear}
                    onChange={(e) => setSGForm("releaseYear", e.target.value)}
                    placeholder="2024"
                  />
                </Field>
                <Field label="Genre">
                  <Input
                    value={form.genre}
                    onChange={(e) => setSGForm("genre", e.target.value)}
                    placeholder="e.g. Jazz"
                  />
                </Field>
              </div>
              <Field label="Tags">
                <TagInput
                  tags={form.tags}
                  onAdd={(t) => setSGForm("tags", [...form.tags, t])}
                  onRemove={(t) =>
                    setSGForm(
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
                disabled={!isFormValid}
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
