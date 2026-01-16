import {
  useState,
  useEffect,
  useCallback,
  ReactNode,
  createContext,
  useContext,
} from "react";
import style from "./ContextMenu.module.scss"; // Adjust path as needed

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
      // Don't close if right-clicking (we want to allow new context menus)
      if (e.button === 2) {
        return;
      }

      // Don't close if clicking inside the context menu
      const target = e.target as HTMLElement;
      if (target.closest(`.${style.contextMenu}`)) {
        return;
      }

      setContextMenu(null);
    };

    // Only listen for left clicks to close the menu
    document.addEventListener("mousedown", handleCloseMenu);

    return () => {
      document.removeEventListener("mousedown", handleCloseMenu);
    };
  }, []);

  return (
    <ContextMenuContext.Provider value={{ contextMenu, setContextMenu }}>
      {children}
    </ContextMenuContext.Provider>
  );
}

// Hook to use in components
export function useContextMenu<T>(id: string) {
  const context = useContext(ContextMenuContext);

  if (!context) {
    throw new Error("useContextMenu must be used within ContextMenuProvider");
  }

  const { contextMenu, setContextMenu } = context;

  const handleRightClick = useCallback(
    (event: React.MouseEvent, data: T) => {
      event.preventDefault();
      event.stopPropagation();
      // Prevent immediate propagation to stop multiple handlers on the same element
      event.nativeEvent.stopImmediatePropagation();

      console.log("Right click triggered", {
        x: event.clientX,
        y: event.clientY,
        data,
      });

      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        data: data,
        id: id,
      });
    },
    [id, setContextMenu],
  );

  const ContextMenuComponent = useCallback(
    ({ children }: { children: ReactNode }) => {
      // Only render if this is the active context menu
      if (!contextMenu || contextMenu.id !== id) return null;

      return (
        <div
          style={{
            top: contextMenu.y,
            left: contextMenu.x,
          }}
          className={style.contextMenu}
          onContextMenu={(e) => e.preventDefault()}
        >
          {children}
        </div>
      );
    },
    [contextMenu, id],
  );

  // Only return contextMenu data if it belongs to this component, with proper typing
  const activeContextMenu =
    contextMenu?.id === id
      ? { ...contextMenu, data: contextMenu.data as T }
      : null;

  return {
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
