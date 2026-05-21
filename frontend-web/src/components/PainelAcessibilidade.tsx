"use client";
import { useState } from "react";
import { useTema } from "@/contexts/TemaContext";

export default function PainelAcessibilidade() {
  const { t, tamanhoFonte, setTamanhoFonte, altoContraste, toggleAltoContraste } = useTema();
  const [aberto, setAberto] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setAberto(!aberto)}
        title="Acessibilidade"
        style={{
          background: "transparent",
          border: `1px solid ${t.borda}`,
          borderRadius: "8px",
          padding: "8px 12px",
          color: t.textoSecundario,
          fontSize: "1rem",
          cursor: "pointer",
          fontFamily: "Plus Jakarta Sans, sans-serif",
        }}
      >
        Aa
      </button>

      {aberto && (
        <div style={{
          position: "absolute",
          right: 0,
          top: "calc(100% + 8px)",
          background: t.fundoCard,
          border: `1px solid ${t.borda}`,
          borderRadius: "12px",
          padding: "20px",
          width: "240px",
          zIndex: 999,
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        }}>
          <div style={{
            fontSize: "0.75rem",
            fontWeight: "700",
            color: t.textoSecundario,
            letterSpacing: "2px",
            marginBottom: "16px",
          }}>
            ACESSIBILIDADE
          </div>

          {/* Tamanho da fonte */}
          <div style={{ marginBottom: "16px" }}>
            <div style={{
              fontSize: "0.8125rem",
              color: t.textoPrincipal,
              fontWeight: "600",
              marginBottom: "10px",
            }}>
              Tamanho do texto
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              {([
                { valor: "normal", label: "A", size: "0.8125rem" },
                { valor: "grande", label: "A", size: "1rem" },
                { valor: "maior", label: "A", size: "1.25rem" },
              ] as const).map((op) => (
                <button
                  key={op.valor}
                  onClick={() => setTamanhoFonte(op.valor)}
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    background: tamanhoFonte === op.valor ? "#F2B705" : "transparent",
                    border: `1px solid ${tamanhoFonte === op.valor ? "#F2B705" : t.borda}`,
                    borderRadius: "8px",
                    color: tamanhoFonte === op.valor ? "#0B1F3A" : t.textoPrincipal,
                    fontSize: op.size,
                    fontWeight: "700",
                    cursor: "pointer",
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                  }}
                >
                  {op.label}
                </button>
              ))}
            </div>
          </div>

          {/* Alto contraste */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <div style={{
              fontSize: "0.8125rem",
              color: t.textoPrincipal,
              fontWeight: "600",
            }}>
              Alto contraste
            </div>
            <button
              onClick={toggleAltoContraste}
              style={{
                width: "44px",
                height: "24px",
                borderRadius: "99px",
                background: altoContraste ? "#F2B705" : t.borda,
                border: "none",
                cursor: "pointer",
                position: "relative",
                transition: "background 0.2s",
              }}
            >
              <div style={{
                position: "absolute",
                top: "3px",
                left: altoContraste ? "23px" : "3px",
                width: "18px",
                height: "18px",
                borderRadius: "50%",
                background: altoContraste ? "#0B1F3A" : "#fff",
                transition: "left 0.2s",
              }} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
