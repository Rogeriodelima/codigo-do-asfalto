"use client";

import Sidebar from "./Sidebar";
import { useTema } from "@/contexts/TemaContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTema();

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        minHeight: "100dvh",
        overflowX: "hidden",
        background: t.fundo,
      }}
    >
      <Sidebar />

      <main
        className="main-conteudo"
        style={{
          flex: 1,
          minWidth: 0,
          width: "100%",
          overflowX: "hidden",
          background: t.fundo,
        }}
      >
        {children}
      </main>
    </div>
  );
}
