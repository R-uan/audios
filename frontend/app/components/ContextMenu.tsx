import {
  useState,
  useEffect,
  useCallback,
  ReactNode,
  createContext,
  useContext,
} from "react";

// Global context for managing a single context menu across the app
interface ContextMenuState {
  x: number;
  y: number;
  data: any;
  id: string; // Identifier for which component owns this menu
}

interface ContextMenuContextType {
  contextMenu: ContextMenuState | null;
  setContextMenu: (menu: ContextMenuState | null) => void;
}

const ContextMenuContext = createContext<ContextMenuContextType | null>(null);

// Provider component - wrap your app with this
export function ContextMenuProvider({ children }: { children: ReactNode }) {
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  useEffect(() => {
    const handleCloseMenu = (e: MouseEvent) => {
      if (e.button === 2) return;
      const target = e.target as HTMLElement;
      if (target.closest("[data-context-menu]")) return;
      setContextMenu(null);
    };
    document.addEventListener("mousedown", handleCloseMenu);
    return () => document.removeEventListener("mousedown", handleCloseMenu);
  }, []);

  return (
    <ContextMenuContext.Provider value={{ contextMenu, setContextMenu }}>
      {children}
    </ContextMenuContext.Provider>
  );
}

export function useContextMenu<T>(id: string) {
  const context = useContext(ContextMenuContext);
  if (!context) {
    throw new Error("useContextMenu must be used within ContextMenuProvider");
  }
  const { contextMenu, setContextMenu } = context;

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const handleRightClick = useCallback(
    (event: React.MouseEvent, data: T) => {
      event.preventDefault();
      event.stopPropagation();
      event.nativeEvent.stopImmediatePropagation();
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        data,
        id,
      });
    },
    [id, setContextMenu],
  );

  const ContextMenuComponent = useCallback(
    ({ children }: { children: ReactNode }) => {
      if (!contextMenu || contextMenu.id !== id) return null;
      return (
        <div
          data-context-menu
          onContextMenu={(e) => e.preventDefault()}
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="fixed z-50 min-w-40 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl shadow-black/50 py-1 flex flex-col"
        >
          {children}
        </div>
      );
    },
    [contextMenu, id],
  );

  const activeContextMenu =
    contextMenu?.id === id
      ? { ...contextMenu, data: contextMenu.data as T }
      : null;

  return {
    closeContextMenu,
    handleRightClick,
    contextMenu: activeContextMenu as {
      x: number;
      y: number;
      data: T;
      id: string;
    } | null,
    ContextMenu: ContextMenuComponent,
  };
}
