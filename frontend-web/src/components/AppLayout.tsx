"use client";

import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { useTema } from "@/contexts/TemaContext";
import { SidebarProvider } from "@/contexts/SidebarContext";

interface AppLayoutProps {
  children: React.ReactNode;
  titulo?: string;
}

export default function AppLayout({ children, titulo }: AppLayoutProps) {
  const { t } = useTema();

  return (
    <SidebarProvider>
      <style>{`
        @media (min-width: 1024px) { .topbar-mobile { display: none !important; } }
      `}</style>
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
          <div className="topbar-mobile">
            <TopBar titulo={titulo} />
          </div>
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
