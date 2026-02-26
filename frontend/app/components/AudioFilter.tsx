import { useState, useMemo, useRef, useEffect } from "react";
import {
  useFilters,
  defaultFilters,
  AudioFilters,
} from "../context/AudioFilterContext";
import { useAudioContext } from "../context/AudioContext";
import { createPortal } from "react-dom";

export function AudioFilter() {
  const { filters, setFilters, set } = useFilters();
  const audioContext = useAudioContext();
  const [includeInput, setIncludeInput] = useState("");
  const [excludeInput, setExcludeInput] = useState("");

  const artistSuggestions = useMemo(
    () =>
      [
        ...new Set(audioContext.audios.map((a) => a.artist).filter(Boolean)),
      ].sort(),
    [audioContext.audios],
  );

  const tagSuggestions = useMemo(
    () =>
      [...new Set(audioContext.audios.flatMap((a) => a.metadata.tags))].sort(),
    [audioContext.audios],
  );

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
    filters.excludeTags.length > 0 ||
    filters.daysAgo !== null;

  return (
    <div className="space-y-2">
      {/* Title */}
      <input
        value={filters.name}
        onChange={(e) => set("name", e.target.value)}
        placeholder="Title..."
        className="w-full px-2 py-1.5 text-xs rounded-md bg-zinc-800 border border-zinc-700 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent transition-all"
      />

      {/* Artist */}
      <AutocompleteInput
        value={filters.artist}
        onChange={(v) => set("artist", v)}
        suggestions={artistSuggestions}
        placeholder="Artist..."
      />

      {/* Added within */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-zinc-500">
            Added within
          </span>
          {filters.daysAgo !== null ? (
            <div className="flex items-center gap-1.5">
              <span className="text-xs tabular-nums text-purple-400">
                {filters.daysAgo === 0 ? "today" : `${filters.daysAgo}d`}
              </span>
              <button
                onClick={() => set("daysAgo", null)}
                className="text-zinc-600 hover:text-zinc-300 transition-colors"
              >
                <svg
                  className="w-3 h-3"
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
            </div>
          ) : (
            <span className="text-xs text-zinc-600">off</span>
          )}
        </div>
        <input
          type="range"
          min={0}
          max={365}
          step={1}
          value={filters.daysAgo ?? 365}
          onChange={(e) => set("daysAgo", parseInt(e.target.value))}
          className="w-full h-1 appearance-none rounded-full bg-zinc-700 accent-purple-500 cursor-pointer"
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-zinc-600">today</span>
          <span className="text-xs text-zinc-600">365d</span>
        </div>
      </div>

      {/* Include tags */}
      <TagTokenInput
        label="Include"
        labelCls="text-emerald-500"
        tagCls="bg-emerald-950 border-emerald-800 text-emerald-300"
        removeCls="hover:text-emerald-200"
        tags={filters.includeTags}
        input={includeInput}
        setInput={setIncludeInput}
        suggestions={tagSuggestions.filter(
          (t) => !filters.includeTags.includes(t),
        )}
        onAdd={() => addTag("includeTags", includeInput, setIncludeInput)}
        onRemove={(t) => removeTag("includeTags", t)}
        onKeyDown={makeTagKeyDown("includeTags", includeInput, setIncludeInput)}
        onSuggestionSelect={(t) => {
          set("includeTags", [...filters.includeTags, t]);
          setIncludeInput("");
        }}
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
        suggestions={tagSuggestions.filter(
          (t) => !filters.excludeTags.includes(t),
        )}
        onAdd={() => addTag("excludeTags", excludeInput, setExcludeInput)}
        onRemove={(t) => removeTag("excludeTags", t)}
        onKeyDown={makeTagKeyDown("excludeTags", excludeInput, setExcludeInput)}
        onSuggestionSelect={(t) => {
          set("excludeTags", [...filters.excludeTags, t]);
          setExcludeInput("");
        }}
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

function DropdownPortal({
  anchorRef,
  children,
}: {
  anchorRef: React.RefObject<HTMLElement>;
  children: React.ReactNode;
}) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (anchorRef.current) setRect(anchorRef.current.getBoundingClientRect());
  }, [anchorRef]);

  if (!rect) return null;

  return createPortal(
    <ul
      style={{
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        height: "150px",
      }}
      className="fixed z-50 bg-zinc-900 border border-zinc-700 rounded-md shadow-xl shadow-black/40 overflow-y-auto"
    >
      {children}
    </ul>,
    document.body,
  );
}

// ── Autocomplete input ────────────────────────────────────────

function AutocompleteInput({
  value,
  onChange,
  suggestions,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  suggestions: string[];
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const filtered = suggestions.filter(
    (s) => s.toLowerCase().includes(value.toLowerCase()) && s !== value,
  );

  return (
    <div className="relative w-full">
      <input
        ref={ref}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 100)}
        placeholder={placeholder}
        className="w-full px-2 py-1.5 text-xs rounded-md bg-zinc-800 border border-zinc-700 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent transition-all"
      />
      {open && filtered.length > 0 && (
        <DropdownPortal anchorRef={ref as React.RefObject<HTMLElement>}>
          {filtered.map((s) => (
            <li key={s}>
              <button
                onMouseDown={() => {
                  onChange(s);
                  setOpen(false);
                }}
                className="w-full text-left px-2 py-1.5 text-xs text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
              >
                {s}
              </button>
            </li>
          ))}
        </DropdownPortal>
      )}
    </div>
  );
}

// ── Tag token input ───────────────────────────────────────────

function TagTokenInput({
  label,
  labelCls,
  tagCls,
  removeCls,
  tags,
  input,
  setInput,
  suggestions,
  onAdd,
  onRemove,
  onKeyDown,
  onSuggestionSelect,
  placeholder,
}: {
  label: string;
  labelCls: string;
  tagCls: string;
  removeCls: string;
  tags: string[];
  input: string;
  setInput: (v: string) => void;
  suggestions: string[];
  onAdd: () => void;
  onRemove: (t: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onSuggestionSelect: (t: string) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filtered = suggestions.filter((s) =>
    s.toLowerCase().includes(input.toLowerCase()),
  );

  return (
    <div>
      <span className={`text-xs font-medium ${labelCls} mb-1 block`}>
        {label}
      </span>
      <div className="relative w-full">
        <div
          ref={wrapperRef}
          className="flex flex-wrap gap-1 p-1.5 min-h-8 rounded-md bg-zinc-800 border border-zinc-700 focus-within:ring-1 focus-within:ring-purple-500 focus-within:border-transparent transition-all"
        >
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
            onChange={(e) => {
              setInput(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 100)}
            onKeyDown={onKeyDown}
            className="flex-1 min-w-12 bg-transparent text-xs text-zinc-200 placeholder-zinc-600 outline-none"
            placeholder={tags.length === 0 ? placeholder : ""}
          />
        </div>
        {open && filtered.length > 0 && (
          <DropdownPortal
            anchorRef={wrapperRef as React.RefObject<HTMLElement>}
          >
            {filtered.map((s) => (
              <li key={s}>
                <button
                  onMouseDown={() => {
                    onSuggestionSelect(s);
                    setOpen(false);
                  }}
                  className="w-full text-left px-2 py-1.5 text-xs text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
                >
                  {s}
                </button>
              </li>
            ))}
          </DropdownPortal>
        )}
      </div>
    </div>
  );
}
