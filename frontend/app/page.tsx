"use client";
import Image from "next/image";
import { AudioContextProvider } from "./context/AudioContext";
import { AudioCatalog } from "./components/AudioCatalog";
import { LeftSection } from "./components/LeftSection";
import style from "./page.module.scss";
import { RightSection } from "./components/RightSection";
import { QueueContextProvider } from "./context/QueueContext";

export default function Home() {
  return (
    <QueueContextProvider>
      <AudioContextProvider>
        <div className={style.mainWrapper}>
          <main className={style.main}>
            <header className={style.header}></header>
            <div className={style.middleSection}>
              <LeftSection />
              <AudioCatalog />
              <RightSection />
            </div>
            <div className={style.queueControls}></div>
          </main>
        </div>
      </AudioContextProvider>
    </QueueContextProvider>
  );
}
