import { IPostAudio } from "@/app/models/IAudio";
import React, { ReactNode, useState } from "react";
import { Modal } from "../Modal";
import { AudioRequest } from "@/app/shared/AudioRequests";
import { useAudioContext } from "@/app/context/AudioContext";
import { getAudioDuration } from "@/app/helpers/getAudioDuration";

interface SGForm {
  link: string;
  releaseYear: string;
  genrer: string;
  mood: string;
  tags: string[];
}

const defaultSGForm: SGForm = {
  link: "",
  releaseYear: "",
  genrer: "",
  mood: "",
  tags: [],
};

export function CreateSGAudioForm() {
  const audioContext = useAudioContext();
  const [isOpen, setIsOpen] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [form, setForm] = useState<SGForm>(defaultSGForm);

  const isFormValid = form.link.trim();

  function setSGForm<K extends keyof SGForm>(key: K, value: SGForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addTag() {
    const tag = tagInput.trim();
    if (!tag || form.tags.includes(tag)) return;
    setSGForm("tags", [...form.tags, tag]);
    setTagInput("");
  }

  function removeTag(tag: string) {
    setSGForm(
      "tags",
      form.tags.filter((t) => t != tag),
    );
  }

  function handleTagKeyDown(e: React.KeyboardEvent) {
    if (e.key == "Enter") {
      e.preventDefault();
      addTag();
    }

    if (e.key === "Backspace" && !tagInput && form.tags.length > 0)
      removeTag(form.tags[form.tags.length - 1]);
  }

  function handleClose() {
    setIsOpen(false);
    setForm(defaultSGForm);
    setTagInput("");
  }

  async function handleSubmit() {
    if (!isFormValid) return;
    const request = await fetch("http://localhost:3000/api/sg", {
      method: "POST",
      body: JSON.stringify({ url: form.link.trim() }),
      headers: { "Content-Type": "application/json" },
    });

    if (request.ok) {
      const { title, artist, url, source } = await request.json();
      const duration = await getAudioDuration(url);

      const audio: IPostAudio = {
        title,
        artist,
        source,
        link: url,
        duration: duration,
        local: false,
        tags: form.tags,
        mood: form.mood,
        genrer: form.genrer,
        releaseYear: form.releaseYear ? parseInt(form.releaseYear) : null,
      };

      const post = await AudioRequest.AddAudio(audio);
      if (post != null) {
        console.log(post);
        audioContext.addAudio(post);
        setIsOpen(false);
      }
    }
  }
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 rounded-md transition-colors"
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
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
        Add SG Audio
      </button>
      {isOpen && (
        <Modal isOpen onClose={handleClose}>
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-100">
                Add SG Audio
              </h2>
              <button
                onClick={handleClose}
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

            <Field
              label={
                <>
                  Link <Required />
                </>
              }
            >
              <input
                value={form.link}
                onChange={(e) => setSGForm("link", e.target.value)}
                placeholder="https://..."
                className={inputCls}
              />
            </Field>

            <hr className="border-zinc-800" />

            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-widest text-zinc-600">
                Metadata
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Release Year">
                  <input
                    type="number"
                    value={form.releaseYear}
                    onChange={(e) => setSGForm("releaseYear", e.target.value)}
                    placeholder="2024"
                    className={inputCls}
                  />
                </Field>
                <Field label="Genre">
                  <input
                    value={form.genrer}
                    onChange={(e) => setSGForm("genrer", e.target.value)}
                    placeholder="e.g. Jazz"
                    className={inputCls}
                  />
                </Field>
                <Field label="Mood" className="col-span-2">
                  <input
                    value={form.mood}
                    onChange={(e) => setSGForm("mood", e.target.value)}
                    placeholder="e.g. Chill"
                    className={inputCls}
                  />
                </Field>
              </div>
              <Field label="Tags">
                <div className="flex flex-wrap gap-1.5 p-2 min-h-10 rounded-md bg-zinc-800 border border-zinc-700 focus-within:ring-1 focus-within:ring-purple-500 focus-within:border-transparent transition-all">
                  {form.tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 px-1.5 py-0.5 text-xs bg-zinc-700 border border-zinc-600 text-zinc-300 rounded"
                    >
                      {tag}
                      <button
                        onMouseDown={() => removeTag(tag)}
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
                    placeholder={form.tags.length === 0 ? "Add tags…" : ""}
                  />
                </div>
                <p className="mt-1 text-xs text-zinc-600">
                  Enter to add · Backspace to remove last
                </p>
              </Field>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 text-sm rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!isFormValid}
                className="flex-1 px-4 py-2 text-sm rounded-md bg-purple-600 text-white hover:bg-purple-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

const inputCls =
  "w-full px-3 py-2 text-sm rounded-md bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent transition-all";

const Required = () => <span className="text-red-500 ml-0.5">*</span>;

function Field({
  label,
  children,
  className,
}: {
  label: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1 ${className ?? ""}`}>
      <label className="block text-xs text-zinc-500">{label}</label>
      {children}
    </div>
  );
}
