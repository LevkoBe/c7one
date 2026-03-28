import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

interface PanelContextValue {
  visibility: Record<string, boolean>;
  show: (id: string) => void;
  hide: (id: string) => void;
  toggle: (id: string) => void;
  isVisible: (id: string) => boolean;
}

const PanelContext = createContext<PanelContextValue | null>(null);

export function PanelVisibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [visibility, setVisibility] = useState<Record<string, boolean>>({});

  const show = useCallback(
    (id: string) => setVisibility((v) => ({ ...v, [id]: true })),
    [],
  );
  const hide = useCallback(
    (id: string) => setVisibility((v) => ({ ...v, [id]: false })),
    [],
  );
  const toggle = useCallback(
    (id: string) => setVisibility((v) => ({ ...v, [id]: !(v[id] ?? true) })),
    [],
  );
  const isVisible = useCallback(
    (id: string) => visibility[id] ?? true,
    [visibility],
  );

  const value = useMemo(
    () => ({ visibility, show, hide, toggle, isVisible }),
    [visibility, show, hide, toggle, isVisible],
  );

  return (
    <PanelContext.Provider value={value}>{children}</PanelContext.Provider>
  );
}

export function usePanelVisibility(id: string) {
  const ctx = useContext(PanelContext);
  if (!ctx) throw new Error("usePanelVisibility must be inside <PanelRoot>");
  return {
    visible: ctx.isVisible(id),
    show: () => ctx.show(id),
    hide: () => ctx.hide(id),
    toggle: () => ctx.toggle(id),
  };
}

export function usePanelContext() {
  const ctx = useContext(PanelContext);
  if (!ctx) throw new Error("Panel component must be inside <PanelRoot>");
  return ctx;
}
