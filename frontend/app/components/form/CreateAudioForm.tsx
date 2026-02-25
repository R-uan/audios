import { IPostAudio } from "@/app/models/IAudio";
import React, { ReactNode, useState } from "react";
import { Modal } from "../Modal";
import { AudioRequest } from "@/app/shared/AudioRequests";
import { useAudioContext } from "@/app/context/AudioContext";

interface AddAudioForm {
  title: string;
  artist: string;
  link: string;
  source: string;
  local: boolean;
  releaseYear: string;
  genrer: string;
  mood: string;
  tags: string[];
}

const defaultForm: AddAudioForm = {
  title: "",
  artist: "",
  link: "",
  source: "",
  local: false,
  releaseYear: "",
  genrer: "",
  mood: "",
  tags: [],
};

export function CreateAudioForm() {
  const audioContext = useAudioContext();
  const [isOpen, setIsOpen] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [form, setForm] = useState<AddAudioForm>(defaultForm);

  const isValid =
    form.title.trim() &&
    form.artist.trim() &&
    form.link.trim() &&
    form.source.trim();

  function set<K extends keyof AddAudioForm>(key: K, value: AddAudioForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addTag() {
    const tag = tagInput.trim();
    if (!tag || form.tags.includes(tag)) return;
    set("tags", [...form.tags, tag]);
    setTagInput("");
  }

  function removeTag(tag: string) {
    set(
      "tags",
      form.tags.filter((t) => t !== tag),
    );
  }

  function handleTagKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
    if (e.key === "Backspace" && !tagInput && form.tags.length > 0)
      removeTag(form.tags[form.tags.length - 1]);
  }

  function handleClose() {
    setIsOpen(false);
    setForm(defaultForm);
    setTagInput("");
  }

  async function handleSubmit() {
    if (!isValid) return;

    const audio: IPostAudio = {
      title: form.title.trim(),
      artist: form.artist.trim(),
      link: form.link.trim(),
      source: form.source.trim(),
      local: form.local,
      releaseYear: form.releaseYear ? parseInt(form.releaseYear) : null,
      genrer: form.genrer.trim() || null,
      mood: form.mood.trim() || null,
      duration: null,
      tags: form.tags,
    };

    const post = await AudioRequest.AddAudio(audio);
    if (post != null) {
      console.log(post);
      audioContext.addAudio(post);
      setIsOpen(false);
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
            d="M12 4v16m8-8H4"
          />
        </svg>
        Add Audio
      </button>
      {isOpen && (
        <Modal isOpen onClose={handleClose}>
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-100">Add Audio</h2>
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

            {/* Required fields */}
            <div className="space-y-3">
              <Field
                label={
                  <>
                    Title <Required />
                  </>
                }
              >
                <input
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="Track title"
                  className={inputCls}
                />
              </Field>
              <Field
                label={
                  <>
                    Artist <Required />
                  </>
                }
              >
                <input
                  value={form.artist}
                  onChange={(e) => set("artist", e.target.value)}
                  placeholder="Artist name"
                  className={inputCls}
                />
              </Field>
              <Field
                label={
                  <>
                    Link <Required />
                  </>
                }
              >
                <input
                  value={form.link}
                  onChange={(e) => set("link", e.target.value)}
                  placeholder="https://..."
                  className={inputCls}
                />
              </Field>
              <Field
                label={
                  <>
                    Source <Required />
                  </>
                }
              >
                <input
                  value={form.source}
                  onChange={(e) => set("source", e.target.value)}
                  placeholder="Audio source URL or path"
                  className={inputCls}
                />
              </Field>

              {/* Local toggle */}
              <div className="flex items-center justify-between px-3 py-2.5 rounded-md bg-zinc-800 border border-zinc-700">
                <div className="flex flex-col">
                  <span className="text-sm text-zinc-300">Local file</span>
                  <span className="text-xs text-zinc-600">
                    Source is a local path
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => set("local", !form.local)}
                  className={`relative w-9 h-5 rounded-full transition-colors ${form.local ? "bg-purple-600" : "bg-zinc-600"}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.local ? "translate-x-4" : "translate-x-0"}`}
                  />
                </button>
              </div>
            </div>

            <hr className="border-zinc-800" />

            {/* Optional metadata */}
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-widest text-zinc-600">
                Metadata
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Release Year">
                  <input
                    type="number"
                    value={form.releaseYear}
                    onChange={(e) => set("releaseYear", e.target.value)}
                    placeholder="2024"
                    className={inputCls}
                  />
                </Field>
                <Field label="Genre">
                  <input
                    value={form.genrer}
                    onChange={(e) => set("genrer", e.target.value)}
                    placeholder="e.g. Jazz"
                    className={inputCls}
                  />
                </Field>
                <Field label="Mood" className="col-span-2">
                  <input
                    value={form.mood}
                    onChange={(e) => set("mood", e.target.value)}
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
                disabled={!isValid}
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
