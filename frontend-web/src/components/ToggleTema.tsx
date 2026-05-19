"use client";

import { useTema } from "@/contexts/TemaContext";

export default function ToggleTema() {
  const { tema, toggleTema, t } = useTema();

  return (
    <button
      onClick={toggleTema}
      style={{
        background: "transparent",
        border: `1px solid ${t.borda}`,
        borderRadius: "50px",
        padding: "6px 14px",
        color: t.textoSecundario,
        fontSize: "12px",
        letterSpacing: "1px",
        cursor: "pointer",
        fontFamily: "Montserrat, sans-serif",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) => {
        const btn = e.currentTarget;
        btn.style.borderColor = "#F2B705";
        btn.style.color = "#F2B705";
      }}
      onMouseLeave={(e) => {
        const btn = e.currentTarget;
        btn.style.borderColor = t.borda;
        btn.style.color = t.textoSecundario;
      }}
    >
      {tema === "escuro" ? "☀️ Claro" : "🌙 Escuro"}
    </button>
  );
}
