"use client";

import { Menu } from "lucide-react";
import { useTema } from "@/contexts/TemaContext";
import { useSidebarContext } from "@/contexts/SidebarContext";

interface TopBarProps {
  titulo?: string;
}

export default function TopBar({ titulo }: TopBarProps) {
  const { t } = useTema();
  const { abrirRef } = useSidebarContext();

  return (
    <div style={{ position: "sticky", top: 0, zIndex: 100 }}>
      {/* Faixa principal */}
      <div
        style={{
          background: "#0B1F3A",
          height: "52px",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          position: "relative",
        }}
      >
        {/* Hambúrguer */}
        <button
          onClick={() => abrirRef.current?.()}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "#F2B705",
            display: "flex",
            alignItems: "center",
            padding: "6px",
            flexShrink: 0,
          }}
        >
          <Menu size={22} strokeWidth={1.75} />
        </button>

        {/* Logo + Nome — absolutamente centralizado */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              background: "#F2B705",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily: "Anton, sans-serif",
                fontSize: "10px",
                color: "#0B1F3A",
              }}
            >
              CDA
            </span>
          </div>
          <span
            style={{
              fontFamily: "Anton, sans-serif",
              fontSize: "14px",
              color: "#fff",
              letterSpacing: "2px",
              whiteSpace: "nowrap",
            }}
          >
            CÓDIGO DO ASFALTO
          </span>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />
      </div>

      {/* Sub-faixa com título da página */}
      {titulo && (
        <div
          style={{
            background: t.fundoCard,
            borderBottom: `1px solid ${t.borda}`,
            padding: "12px 16px",
          }}
        >
          <span
            style={{
              fontSize: "13px",
              fontWeight: 500,
              letterSpacing: "2px",
              color: t.textoSecundario,
              fontFamily: "Plus Jakarta Sans, sans-serif",
            }}
          >
            {titulo}
          </span>
        </div>
      )}
    </div>
  );
}
