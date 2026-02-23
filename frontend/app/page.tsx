"use client";
import { AudioContextProvider } from "./context/AudioContext";
import { AudioCatalog } from "./components/AudioCatalog";
import { LeftSection } from "./components/LeftSection";
import { RightSection } from "./components/RightSection";
import { QueueContextProvider } from "./context/QueueContext";
import { PlaylistContextProvider } from "./context/PlaylistContext";
import { ContextMenuProvider } from "./components/ContextMenu";
import { AudioControls } from "./components/QueueControls";
import { PlayerProvider } from "./context/PlayerContext";
import { Header } from "./components/Header";
import { FilterProvider } from "./context/AudioFilterContext";

export default function Home() {
  return (
    <FilterProvider>
      <ContextMenuProvider>
        <PlaylistContextProvider>
          <AudioContextProvider>
            <PlayerProvider>
              <QueueContextProvider>
                <div className="h-screen w-screen bg-zinc-950 text-zinc-100 overflow-hidden flex flex-col">
                  <main className="flex flex-col h-full">
                    {/* Top bar */}
                    <Header />

                    {/* Main content — three columns */}
                    <div className="flex flex-1 overflow-hidden">
                      {/* Left — Playlists */}
                      <LeftSection />

                      {/* Center — Audio catalog */}
                      <AudioCatalog />

                      {/* Right — Queue */}
                      <RightSection />
                    </div>

                    {/* Bottom — Player controls */}
                    <AudioControls />
                  </main>
                </div>
              </QueueContextProvider>
            </PlayerProvider>
          </AudioContextProvider>
        </PlaylistContextProvider>
      </ContextMenuProvider>
    </FilterProvider>
  );
}
