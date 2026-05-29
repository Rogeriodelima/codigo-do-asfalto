"use client";

import { createContext, useContext, useRef } from "react";

interface SidebarCtx {
  abrirRef: React.MutableRefObject<(() => void) | null>;
}

const SidebarContext = createContext<SidebarCtx>({
  abrirRef: { current: null },
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const abrirRef = useRef<(() => void) | null>(null);
  return (
    <SidebarContext.Provider value={{ abrirRef }}>
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebarContext = () => useContext(SidebarContext);
