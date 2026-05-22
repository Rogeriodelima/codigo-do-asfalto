"use client";

import { useTema } from "@/contexts/TemaContext";
import Sidebar from "@/components/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTema();

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: t.fundo,
      }}
    >
      <Sidebar />
      <main style={{ flex: 1, minWidth: 0, overflowX: "hidden" }}>
        {children}
      </main>
    </div>
  );
}
