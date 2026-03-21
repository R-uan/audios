"use client";
import { AudioContextProvider } from "./context/AudioContext";
import { AudioCatalog } from "./components/AudioCatalog";
import { LeftSection } from "./components/LeftSection";
import { RightSection } from "./components/RightSection";
import { QueueContextProvider } from "./context/QueueContext";
import { PlaylistContextProvider } from "./context/PlaylistContext";
import { ContextMenuProvider } from "./components/ContextMenu";
import { AudioControls } from "./components/QueueControls";
import { Header } from "./components/Header";
import { FilterProvider } from "./context/AudioFilterContext";
import { useState } from "react";
import { NoticeWindow } from "./components/NoticeWindow";
import { NoticeProvider } from "./context/NoticeContext";

export default function Home() {
  const [queueOpen, setQueueOpen] = useState(false);

  return (
    <NoticeProvider>
      <FilterProvider>
        <ContextMenuProvider>
          <PlaylistContextProvider>
            <AudioContextProvider>
              <QueueContextProvider>
                <NoticeWindow />
                <div className="h-screen w-screen bg-zinc-950 text-zinc-100 overflow-hidden flex flex-col">
                  <main className="flex flex-col h-full">
                    <Header
                      onToggleQueue={() => setQueueOpen((prev) => !prev)}
                    />
                    <div className="flex flex-1 overflow-hidden">
                      <LeftSection />
                      <AudioCatalog />
                      {queueOpen && <RightSection />}
                    </div>
                    <AudioControls />
                  </main>
                </div>
              </QueueContextProvider>
            </AudioContextProvider>
          </PlaylistContextProvider>
        </ContextMenuProvider>
      </FilterProvider>
    </NoticeProvider>
  );
}
