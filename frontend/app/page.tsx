"use client";
import Image from "next/image";
import { AudioContextProvider } from "./context/AudioContext";
import { AudioCatalog } from "./components/AudioCatalog";
import { LeftSection } from "./components/LeftSection";
import style from "./page.module.scss";
import { RightSection } from "./components/RightSection";
import { QueueContextProvider } from "./context/QueueContext";
import { PlaylistContextProvider } from "./context/PlaylistContext";
import { ContextMenuProvider } from "./components/ContextMenu";

export default function Home() {
  return (
    <ContextMenuProvider>
      <PlaylistContextProvider>
        <AudioContextProvider>
          <QueueContextProvider>
            <div className={style.mainWrapper}>
              <main className={style.main}>
                <header className={style.header}></header>
                <div className={style.middleSection}>
                  <LeftSection />
                  <AudioCatalog />
                </div>
                <div className={style.queueControls}></div>
              </main>
            </div>
          </QueueContextProvider>
        </AudioContextProvider>
      </PlaylistContextProvider>
    </ContextMenuProvider>
  );
}
