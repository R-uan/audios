"use client";
import Image from "next/image";
import { AudioContextProvider } from "./context/AudioContext";
import { AudioCatalog } from "./components/AudioCatalog";
import { LeftSection } from "./components/LeftSection";

export default function Home() {
  return (
    <AudioContextProvider>
      <div>
        <main className="flex flex-row">
          <LeftSection />
          <AudioCatalog />
        </main>
      </div>
    </AudioContextProvider>
  );
}
