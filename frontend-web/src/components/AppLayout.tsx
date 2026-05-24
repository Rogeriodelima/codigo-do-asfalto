"use client";

import Sidebar from "./Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        minHeight: "100dvh",
        overflowX: "hidden",
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
        }}
      >
        {children}
      </main>
    </div>
  );
}
