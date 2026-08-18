import { useRef, useState } from "react";
import { X } from "lucide-react";
import { DropdownPortal } from "./DropdownPortal";

export interface TagInputProps {
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
  suggestions?: string[];
  placeholder?: string;
  label?: string;
  labelClassName?: string;
  tagClassName?: string;
  removeClassName?: string;
  className?: string;
}

export function TagInput({
  tags,
  onAdd,
  onRemove,
  suggestions = [],
  placeholder = "Add tag…",
  label,
  labelClassName = "text-muted",
  tagClassName = "bg-surface-3 border-border-strong text-foreground-soft",
  removeClassName = "text-muted hover:text-danger",
  className = "",
}: TagInputProps) {
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filtered = suggestions.filter(
    (s) => s.toLowerCase().includes(input.toLowerCase()) && !tags.includes(s),
  );

  function commit(tag: string) {
    const t = tag.trim();
    if (!t || tags.includes(t)) {
      setInput("");
      return;
    }
    onAdd(t);
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      const first = filtered[0];
      commit(first ?? input);
    }
    if (e.key === "Backspace" && !input && tags.length > 0)
      onRemove(tags[tags.length - 1]);
  }

  return (
    <div className={className}>
      {label && (
        <span className={`text-xs font-medium mb-1 block ${labelClassName}`}>
          {label}
        </span>
      )}
      <div className="relative w-full">
        <div
          ref={wrapperRef}
          className="flex flex-wrap gap-1 p-1.5 min-h-8 rounded-md bg-surface-2 border border-border-strong focus-within:ring-1 focus-within:ring-accent focus-within:border-transparent transition-all"
        >
          {tags.map((t) => (
            <span
              key={t}
              className={`flex items-center gap-0.5 px-1.5 py-0.5 text-xs border rounded ${tagClassName}`}
            >
              {t}
              <button
                type="button"
                onMouseDown={() => onRemove(t)}
                aria-label={`Remove ${t}`}
                className={`transition-colors ${removeClassName}`}
              >
                <X className="w-2.5 h-2.5" />
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
            onKeyDown={handleKeyDown}
            className="flex-1 min-w-12 bg-transparent text-xs text-foreground placeholder-muted-faint outline-none"
            placeholder={tags.length === 0 ? placeholder : ""}
          />
        </div>
        {open && filtered.length > 0 && (
          <DropdownPortal anchorRef={wrapperRef}>
            {filtered.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  onMouseDown={() => {
                    onAdd(s);
                    setInput("");
                    setOpen(false);
                  }}
                  className="w-full text-left px-2 py-1.5 text-xs text-foreground-soft hover:text-foreground hover:bg-surface-2 transition-colors"
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
