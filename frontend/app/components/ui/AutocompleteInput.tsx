import { useRef, useState } from "react";
import { DropdownPortal } from "./DropdownPortal";

export function AutocompleteInput({
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
        className="w-full px-2 py-1.5 text-xs rounded-md bg-surface-2 border border-border-strong text-foreground placeholder-muted-faint focus:outline-none focus:ring-1 focus:ring-accent focus:border-transparent transition-all"
      />
      {open && filtered.length > 0 && (
        <DropdownPortal anchorRef={ref}>
          {filtered.map((s) => (
            <li key={s}>
              <button
                onMouseDown={() => {
                  onChange(s);
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
  );
}
