"use client";

import { useState, useEffect } from "react";
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
  const [mobile, setMobile] = useState(false);

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

  useEffect(() => {
    function verificar() {
      setMobile(window.innerWidth <= 1024);
    }

    verificar();

    window.addEventListener("resize", verificar);

    return () => window.removeEventListener("resize", verificar);
  }, []);

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

    if (mobile) {
      setEstado("recolhida");
    }
  }

  function sair() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    router.push("/login");
  }

  const largura =
    estado === "expandida" ? 240 : estado === "recolhida" ? 56 : 0;

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
        >
          <ChevronRight size={16} strokeWidth={1.75} />
        </button>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .sidebar-aside {
          position: sticky;
          top: 0;
        }

        @media (max-width: 1024px) {
          .sidebar-aside {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            z-index: 999 !important;
          }

          .main-conteudo {
            width: 100% !important;
            min-width: 0 !important;
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
          transition: "width 0.25s ease",
          overflowX: "hidden",
          overflowY: "auto",
          flexShrink: 0,
          zIndex: 100,
        }}
      >
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
                }}
              >
                CÓDIGO DO ASFALTO
              </span>
            </div>
          )}

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
            }}
          >
            {estado === "expandida" ? (
              <PanelLeftClose size={20} strokeWidth={1.75} />
            ) : (
              <Menu size={20} strokeWidth={1.75} />
            )}
          </button>
        </div>

        <nav
          style={{
            flex: 1,
            padding: "4px 0",
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
                    border: "none",
                    borderLeft: `3px solid ${
                      ativo ? cor.ativo : "transparent"
                    }`,
                    cursor: "pointer",
                    color: ativo ? cor.ativo : cor.texto,
                    fontSize: "13px",
                    fontWeight: ativo ? "700" : "500",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Icon size={20} strokeWidth={1.75} />

                  {estado === "expandida" && <span>{label}</span>}
                </button>

                {estado === "recolhida" && (
                  <Tooltip label={label} visible={tooltip === label} />
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
