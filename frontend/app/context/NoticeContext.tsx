import { createContext, ReactNode, useContext, useState } from "react";
import { INotice } from "../models/INotice";

interface INoticeContext {
  notices: INotice[];
  sendNotice: (notice: INotice) => void;
}

const NoticeContext = createContext<INoticeContext | undefined>(undefined);

export function NoticeProvider({ children }: { children: ReactNode }) {
  const [notices, setNotice] = useState<INotice[]>([]);

  async function sendNotice(notice: INotice) {
    setNotice((prev) => [...prev, notice]);
    setTimeout(() => {
      setNotice((prev) => prev.filter((n) => n.id !== notice.id));
    }, 5000);
  }

  return (
    <NoticeContext.Provider value={{ notices, sendNotice }}>
      {children}
    </NoticeContext.Provider>
  );
}

export function useNoticeContext() {
  const context = useContext(NoticeContext);
  if (context == undefined)
    throw new Error("NoticeContext used outside of provider.");
  return context;
}
