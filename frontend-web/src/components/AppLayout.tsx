"use client";
import Sidebar from "./Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", width: "100%" }}>
      <Sidebar />
      <main
        className="main-conteudo"
        style={{
          flex: 1,
          minWidth: 0,
          maxWidth: "100%",
          overflowY: "auto",
          overflowX: "hidden",
          minHeight: "100vh",
        }}
      >
        {children}
      </main>
    </div>
  );
}