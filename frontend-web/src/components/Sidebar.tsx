"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTema } from "@/contexts/TemaContext";
import {
  LayoutDashboard,
  ScrollText,
  GitBranch,
  TrendingUp,
  User,
  Menu,
  PanelLeftClose,
  Sun,
  Moon,
  LogOut,
  ALargeSmall,
  Contrast,
  ChevronRight,
} from "lucide-react";

type TamanhoFonte = "normal" | "grande" | "maior";
type EstadoSidebar = "oculta" | "recolhida" | "expandida";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Painel" },
  { href: "/experiencias", icon: ScrollText, label: "Experiências" },
  { href: "/timeline", icon: GitBranch, label: "Timeline" },
  { href: "/evolucao", icon: TrendingUp, label: "Evolução" },
  { href: "/perfil", icon: User, label: "Perfil" },
];

const TAMANHOS: { key: TamanhoFonte; size: number }[] = [
  { key: "normal", size: 11 },
  { key: "grande", size: 14 },
  { key: "maior", size: 17 },
];

function Tooltip({ label, visible }: { label: string; visible: boolean }) {
  return (
    <div
      style={{
        position: "absolute",
        left: "calc(100% + 10px)",
        top: "50%",
        transform: "translateY(-50%)",
        background: "#0B1F3A",
        color: "#fff",
        fontSize: "12px",
        borderRadius: "6px",
        padding: "4px 10px",
        whiteSpace: "nowrap",
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        zIndex: 999,
        pointerEvents: "none",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.15s ease",
      }}
    >
      {label}
    </div>
  );
}

export default function Sidebar() {
  const [estado, setEstado] = useState<EstadoSidebar>("recolhida");
  const [tooltip, setTooltip] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const {
    tema,
    toggleTema,
    t,
    tamanhoFonte,
    setTamanhoFonte,
    altoContraste,
    toggleAltoContraste,
  } = useTema();

  const escuro = tema === "escuro";
  const cor = {
    bg: t.fundoCard,
    borda: t.borda,
    texto: t.textoSecundario,
    textoPrinc: t.textoPrincipal,
    ativo: "#F2B705",
    fundoAtivo: escuro ? "rgba(242,183,5,0.10)" : "rgba(11,31,58,0.06)",
    hover: escuro ? "rgba(255,255,255,0.04)" : "rgba(11,31,58,0.04)",
  };

  function navegar(href: string) {
    router.push(href);
    setEstado("recolhida");
  }

  function sair() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    router.push("/login");
  }

  const largura =
    estado === "expandida" ? 240 : estado === "recolhida" ? 64 : 0;

  function estiloBtnRodape(extra?: React.CSSProperties): React.CSSProperties {
    return {
      width: "100%",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: estado === "expandida" ? "8px 16px" : "8px 0",
      justifyContent: estado === "expandida" ? "flex-start" : "center",
      background: "transparent",
      border: "none",
      cursor: "pointer",
      color: cor.texto,
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontSize: "12px",
      fontWeight: "500",
      whiteSpace: "nowrap",
      transition: "background 0.15s",
      position: "relative",
      ...extra,
    };
  }

  function onHover(e: React.MouseEvent<HTMLButtonElement>, entrou: boolean) {
    (e.currentTarget as HTMLElement).style.background = entrou
      ? cor.hover
      : "transparent";
  }

  if (estado === "oculta") {
    return (
      <div
        style={{
          position: "fixed",
          left: 0,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 200,
        }}
      >
        <button
          onClick={() => setEstado("recolhida")}
          style={{
            background: cor.bg,
            border: `1px solid ${cor.borda}`,
            borderLeft: "none",
            borderRadius: "0 6px 6px 0",
            cursor: "pointer",
            color: cor.texto,
            padding: "8px 4px",
            display: "flex",
            alignItems: "center",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.color = cor.ativo)
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.color = cor.texto)
          }
        >
          <ChevronRight size={16} strokeWidth={1.75} />
        </button>
      </div>
    );
  }

  return (
    <>
      {estado === "expandida" && (
        <div
          onClick={() => setEstado("recolhida")}
          className="sidebar-overlay"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 149,
            display: "none",
          }}
        />
      )}

      <style>{`
        .sidebar-aside {
          position: sticky;
          top: 0;
          height: 100dvh;
        }

        .main-conteudo {
          min-width: 0;
          width: 100%;
        }

        @media (max-width: 1024px) {
          .sidebar-aside {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            z-index: 300 !important;
            height: 100dvh !important;
          }

          .main-conteudo {
            width: 100%;
            margin-left: 0 !important;
          }

          .sidebar-overlay {
            display: block !important;
          }
        }

        @media (max-width: 768px) {
          .sidebar-aside {
            width: 56px !important;
            min-width: 56px !important;
          }
        }
      `}</style>

      <aside
        className="sidebar-aside"
        style={{
          width: `${largura}px`,
          minWidth: `${largura}px`,
          height: "100dvh",
          background: cor.bg,
          borderRight: `1px solid ${cor.borda}`,
          display: "flex",
          flexDirection: "column",
          transition: "width 0.25s ease, min-width 0.25s ease",
          overflowX: "hidden",
          overflowY: "auto",
          flexShrink: 0,
          top: 0,
          zIndex: 100,
          willChange: "width",
        }}
      >
        {/* Cabeçalho */}
        <div
          style={{
            borderBottom: `1px solid ${cor.borda}`,
            minHeight: "52px",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: estado === "expandida" ? "space-between" : "center",
            padding: estado === "expandida" ? "0 12px" : "0",
            gap: "8px",
          }}
        >
          {estado === "expandida" && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flex: 1,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  flexShrink: 0,
                  background: "#0B1F3A",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    fontFamily: "Anton, sans-serif",
                    fontSize: "10px",
                    color: "#F2B705",
                    letterSpacing: "1px",
                  }}
                >
                  CDA
                </span>
              </div>
              <span
                style={{
                  fontFamily: "Anton, sans-serif",
                  fontSize: "11px",
                  letterSpacing: "2px",
                  color: cor.textoPrinc,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                }}
              >
                CÓDIGO DO ASFALTO
              </span>
            </div>
          )}

          <div style={{ position: "relative", flexShrink: 0 }}>
            <button
              onClick={() =>
                setEstado(estado === "expandida" ? "recolhida" : "expandida")
              }
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: cor.texto,
                padding: "8px",
                display: "flex",
                alignItems: "center",
                borderRadius: "6px",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = cor.ativo;
                if (estado === "recolhida") setTooltip("Expandir menu");
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = cor.texto;
                setTooltip(null);
              }}
            >
              {estado === "expandida" ? (
                <PanelLeftClose size={20} strokeWidth={1.75} />
              ) : (
                <Menu size={20} strokeWidth={1.75} />
              )}
            </button>
            {estado === "recolhida" && (
              <Tooltip
                label="Expandir menu"
                visible={tooltip === "Expandir menu"}
              />
            )}
          </div>

          {estado === "expandida" && (
            <button
              onClick={() => setEstado("oculta")}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: cor.texto,
                padding: "4px",
                fontSize: "10px",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                borderRadius: "4px",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.color = cor.ativo)
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.color = cor.texto)
              }
            >
              ocultar
            </button>
          )}
        </div>

        {/* Navegação */}
        <nav
          style={{
            flex: 1,
            padding: "4px 0",
            overflowY: "hidden",
            minHeight: 0,
          }}
        >
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const ativo =
              pathname === href ||
              (href !== "/dashboard" && pathname.startsWith(href + "/"));
            return (
              <div key={href} style={{ position: "relative" }}>
                <button
                  onClick={() => navegar(href)}
                  onMouseEnter={(e) => {
                    if (!ativo)
                      (e.currentTarget as HTMLElement).style.background =
                        cor.hover;
                    if (estado === "recolhida") setTooltip(label);
                  }}
                  onMouseLeave={(e) => {
                    if (!ativo)
                      (e.currentTarget as HTMLElement).style.background =
                        "transparent";
                    setTooltip(null);
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: estado === "expandida" ? "10px 16px" : "10px 0",
                    justifyContent:
                      estado === "expandida" ? "flex-start" : "center",
                    background: ativo ? cor.fundoAtivo : "transparent",
                    borderTop: "none",
                    borderRight: "none",
                    borderBottom: "none",
                    borderLeft: `3px solid ${ativo ? cor.ativo : "transparent"}`,
                    cursor: "pointer",
                    color: ativo ? cor.ativo : cor.texto,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: "13px",
                    fontWeight: ativo ? "700" : "500",
                    textAlign: "left",
                    transition: "background 0.15s, color 0.15s",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Icon
                    size={20}
                    strokeWidth={ativo ? 2.5 : 1.75}
                    style={{ flexShrink: 0 }}
                  />
                  {estado === "expandida" && <span>{label}</span>}
                </button>
                {estado === "recolhida" && (
                  <Tooltip label={label} visible={tooltip === label} />
                )}
              </div>
            );
          })}
        </nav>

        {/* Rodapé */}
        <div
          style={{
            borderTop: `1px solid ${cor.borda}`,
            padding: "4px 0",
            flexShrink: 0,
          }}
        >
          {/* Tamanho de fonte */}
          {estado === "expandida" ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
              }}
            >
              <ALargeSmall
                size={16}
                strokeWidth={1.75}
                style={{ color: cor.texto, flexShrink: 0 }}
              />
              <div style={{ display: "flex", gap: "4px" }}>
                {TAMANHOS.map(({ key, size }) => {
                  const sel = tamanhoFonte === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setTamanhoFonte(key)}
                      style={{
                        background: sel ? "#F2B705" : "transparent",
                        border: `1px solid ${sel ? "#F2B705" : cor.borda}`,
                        borderRadius: "4px",
                        width: "24px",
                        height: "24px",
                        cursor: "pointer",
                        color: sel ? "#0B1F3A" : cor.texto,
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: `${size}px`,
                        fontWeight: "700",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      A
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setEstado("expandida")}
                style={estiloBtnRodape({ justifyContent: "center" })}
                onMouseEnter={(e) => {
                  onHover(e, true);
                  setTooltip("Tamanho da fonte");
                }}
                onMouseLeave={(e) => {
                  onHover(e, false);
                  setTooltip(null);
                }}
              >
                <ALargeSmall
                  size={16}
                  strokeWidth={1.75}
                  style={{ flexShrink: 0 }}
                />
              </button>
              <Tooltip
                label="Tamanho da fonte"
                visible={tooltip === "Tamanho da fonte"}
              />
            </div>
          )}

          {/* Alto contraste */}
          <div style={{ position: "relative" }}>
            <button
              onClick={toggleAltoContraste}
              style={estiloBtnRodape({
                color: altoContraste ? cor.ativo : cor.texto,
              })}
              onMouseEnter={(e) => {
                onHover(e, true);
                if (estado === "recolhida") setTooltip("Alto contraste");
              }}
              onMouseLeave={(e) => {
                onHover(e, false);
                setTooltip(null);
              }}
            >
              <Contrast
                size={16}
                strokeWidth={1.75}
                style={{ flexShrink: 0 }}
              />
              {estado === "expandida" && <span>Alto contraste</span>}
            </button>
            {estado === "recolhida" && (
              <Tooltip
                label="Alto contraste"
                visible={tooltip === "Alto contraste"}
              />
            )}
          </div>

          {/* Modo claro/escuro */}
          <div style={{ position: "relative" }}>
            <button
              onClick={toggleTema}
              style={estiloBtnRodape()}
              onMouseEnter={(e) => {
                onHover(e, true);
                if (estado === "recolhida")
                  setTooltip(escuro ? "Modo claro" : "Modo escuro");
              }}
              onMouseLeave={(e) => {
                onHover(e, false);
                setTooltip(null);
              }}
            >
              {escuro ? (
                <Sun size={16} strokeWidth={1.75} style={{ flexShrink: 0 }} />
              ) : (
                <Moon size={16} strokeWidth={1.75} style={{ flexShrink: 0 }} />
              )}
              {estado === "expandida" && (
                <span>{escuro ? "Modo claro" : "Modo escuro"}</span>
              )}
            </button>
            {estado === "recolhida" && (
              <Tooltip
                label={escuro ? "Modo claro" : "Modo escuro"}
                visible={tooltip === "Modo claro" || tooltip === "Modo escuro"}
              />
            )}
          </div>

          {/* Sair */}
          <div style={{ position: "relative" }}>
            <button
              onClick={sair}
              style={estiloBtnRodape()}
              onMouseEnter={(e) => {
                onHover(e, true);
                if (estado === "recolhida") setTooltip("Sair");
              }}
              onMouseLeave={(e) => {
                onHover(e, false);
                setTooltip(null);
              }}
            >
              <LogOut size={16} strokeWidth={1.75} style={{ flexShrink: 0 }} />
              {estado === "expandida" && <span>Sair</span>}
            </button>
            {estado === "recolhida" && (
              <Tooltip label="Sair" visible={tooltip === "Sair"} />
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
