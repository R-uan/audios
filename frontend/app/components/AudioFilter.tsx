import { useState } from "react";
import {
  AudioFilters,
  defaultFilters,
  useFilters,
} from "../context/AudioFilterContext";

export function AudioFilter() {
  const { filters, setFilters } = useFilters();
  const [includeInput, setIncludeInput] = useState("");
  const [excludeInput, setExcludeInput] = useState("");

  const set = <K extends keyof AudioFilters>(key: K, value: AudioFilters[K]) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const addTag = (
    field: "includeTags" | "excludeTags",
    input: string,
    setInput: (v: string) => void,
  ) => {
    const tag = input.trim();
    if (!tag || filters[field].includes(tag)) return;
    set(field, [...filters[field], tag]);
    setInput("");
  };

  const removeTag = (field: "includeTags" | "excludeTags", tag: string) =>
    set(
      field,
      filters[field].filter((t) => t !== tag),
    );

  const makeTagKeyDown =
    (
      field: "includeTags" | "excludeTags",
      input: string,
      setInput: (v: string) => void,
    ) =>
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addTag(field, input, setInput);
      }
      if (e.key === "Backspace" && !input && filters[field].length > 0)
        removeTag(field, filters[field][filters[field].length - 1]);
    };

  const hasAnyFilter =
    filters.name ||
    filters.artist ||
    filters.includeTags.length > 0 ||
    filters.excludeTags.length > 0;

  return (
    <div className="space-y-2">
      {/* Name */}
      <input
        value={filters.name}
        onChange={(e) => set("name", e.target.value)}
        placeholder="Title..."
        className="w-full px-2 py-1.5 text-xs rounded-md bg-zinc-800 border border-zinc-700 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent transition-all"
      />

      {/* Artist */}
      <input
        value={filters.artist}
        onChange={(e) => set("artist", e.target.value)}
        placeholder="Artist..."
        className="w-full px-2 py-1.5 text-xs rounded-md bg-zinc-800 border border-zinc-700 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent transition-all"
      />

      {/* Include tags */}
      <TagTokenInput
        label="Include"
        labelCls="text-emerald-500"
        tagCls="bg-emerald-950 border-emerald-800 text-emerald-300"
        removeCls="hover:text-emerald-200"
        tags={filters.includeTags}
        input={includeInput}
        setInput={setIncludeInput}
        onAdd={() => addTag("includeTags", includeInput, setIncludeInput)}
        onRemove={(t) => removeTag("includeTags", t)}
        onKeyDown={makeTagKeyDown("includeTags", includeInput, setIncludeInput)}
        placeholder="Include tag..."
      />

      {/* Exclude tags */}
      <TagTokenInput
        label="Exclude"
        labelCls="text-red-500"
        tagCls="bg-red-950 border-red-800 text-red-300"
        removeCls="hover:text-red-200"
        tags={filters.excludeTags}
        input={excludeInput}
        setInput={setExcludeInput}
        onAdd={() => addTag("excludeTags", excludeInput, setExcludeInput)}
        onRemove={(t) => removeTag("excludeTags", t)}
        onKeyDown={makeTagKeyDown("excludeTags", excludeInput, setExcludeInput)}
        placeholder="Exclude tag..."
      />

      {/* Clear */}
      {hasAnyFilter && (
        <button
          onClick={() => {
            setFilters(defaultFilters);
            setIncludeInput("");
            setExcludeInput("");
          }}
          className="w-full px-2 py-1 text-xs text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-md transition-colors"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

function TagTokenInput({
  label,
  labelCls,
  tagCls,
  removeCls,
  tags,
  input,
  setInput,
  onAdd,
  onRemove,
  onKeyDown,
  placeholder,
}: {
  label: string;
  labelCls: string;
  tagCls: string;
  removeCls: string;
  tags: string[];
  input: string;
  setInput: (v: string) => void;
  onAdd: () => void;
  onRemove: (t: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  placeholder: string;
}) {
  return (
    <div>
      <span className={`text-xs font-medium ${labelCls} mb-1 block`}>
        {label}
      </span>
      <div className="flex flex-wrap gap-1 p-1.5 min-h-8 rounded-md bg-zinc-800 border border-zinc-700 focus-within:ring-1 focus-within:ring-purple-500 focus-within:border-transparent transition-all">
        {tags.map((t) => (
          <span
            key={t}
            className={`flex items-center gap-0.5 px-1.5 py-0.5 text-xs border rounded ${tagCls}`}
          >
            {t}
            <button
              onMouseDown={() => onRemove(t)}
              className={`transition-colors ${removeCls}`}
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
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          className="flex-1 min-w-12 bg-transparent text-xs text-zinc-200 placeholder-zinc-600 outline-none"
          placeholder={tags.length === 0 ? placeholder : ""}
        />
      </div>
    </div>
  );
}
