"use client";
import Sidebar from "./Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        height: "100dvh",
        width: "100%",
        overflow: "hidden",
      }}
    >
      <Sidebar />
      <main
        className="main-conteudo"
        style={{
          flex: 1,
          minWidth: 0,
          maxWidth: "100%",
          overflow: "hidden",
        }}
      >
        {children}
      </main>
    </div>
  );
}
