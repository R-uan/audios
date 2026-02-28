"use client";

import { CreateSGAudioForm } from "./form/CreateSGAudioForm";
import { CreateAudioForm } from "./form/CreateAudioForm";

export function Header({ onToggleQueue }: { onToggleQueue: () => void }) {
  return (
    <header className="h-14 justify-between flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm px-4">
      <div className="flex row">
        <CreateAudioForm />
        <CreateSGAudioForm />
      </div>
      <div className="ml-auto">
        <button
          onClick={onToggleQueue}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 rounded-md transition-colors"
          title="Toggle queue"
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
              d="M4 6h16M4 10h10M4 14h7M15 17h6M18 14v6"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}
