"use client";

import { CreateSGAudioForm } from "./form/CreateSGAudioForm";
import { CreateAudioForm } from "./form/CreateAudioForm";

export function Header() {
  return (
    <header className="h-14 flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm px-4">
      <CreateAudioForm />
      <CreateSGAudioForm />
    </header>
  );
}
