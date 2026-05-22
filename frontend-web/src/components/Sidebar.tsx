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
} from "lucide-react";

type TamanhoFonte = "normal" | "grande" | "maior";

const NAV_ITEMS = [
  { href: "/dashboard",    icon: LayoutDashboard, label: "Painel"       },
  { href: "/experiencias", icon: ScrollText,       label: "Experiências" },
  { href: "/timeline",     icon: GitBranch,        label: "Timeline"     },
  { href: "/evolucao",     icon: TrendingUp,       label: "Evolução"     },
  { href: "/perfil",       icon: User,             label: "Perfil"       },
];

const TAMANHOS: { key: TamanhoFonte; size: number }[] = [
  { key: "normal", size: 11 },
  { key: "grande", size: 14 },
  { key: "maior",  size: 17 },
];

export default function Sidebar() {
  const [aberta, setAberta] = useState(true);
  const router   = useRouter();
  const pathname = usePathname();
  const { tema, toggleTema, t, tamanhoFonte, setTamanhoFonte, altoContraste, toggleAltoContraste } = useTema();

  const escuro = tema === "escuro";

  const cor = {
    bg:         t.fundoCard,
    borda:      t.borda,
    texto:      t.textoSecundario,
    textoPrinc: t.textoPrincipal,
    ativo:      "#F2B705",
    fundoAtivo: escuro ? "rgba(242,183,5,0.10)" : "rgba(11,31,58,0.06)",
    hover:      escuro ? "rgba(255,255,255,0.04)" : "rgba(11,31,58,0.04)",
  };

  function navegar(href: string) { router.push(href); }

  function sair() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    router.push("/login");
  }

  function navBtn(ativo: boolean): React.CSSProperties {
    return {
      width: "100%",
      display: "flex",
      alignItems: "center",
      gap: "11px",
      padding: aberta ? "10px 16px" : "10px 0",
      justifyContent: aberta ? "flex-start" : "center",
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
      letterSpacing: "0.2px",
      textAlign: "left",
      transition: "background 0.15s, color 0.15s",
      whiteSpace: "nowrap",
    };
  }

  const btnRodape: React.CSSProperties = {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "11px",
    padding: aberta ? "9px 16px" : "9px 0",
    justifyContent: aberta ? "flex-start" : "center",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: cor.texto,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: "12px",
    fontWeight: "500",
    whiteSpace: "nowrap",
    transition: "background 0.15s",
  };

  function onHover(e: React.MouseEvent<HTMLButtonElement>, entrou: boolean) {
    (e.currentTarget as HTMLButtonElement).style.background =
      entrou ? cor.hover : "transparent";
  }

  return (
    <aside
      style={{
        width: aberta ? "240px" : "64px",
        height: "100vh",
        background: cor.bg,
        borderRight: `1px solid ${cor.borda}`,
        display: "flex",
        flexDirection: "column",
        transition: "width 0.25s ease",
        overflow: "hidden",
        flexShrink: 0,
        position: "sticky",
        top: 0,
      }}
    >
      {/* ── Cabeçalho ── */}
      {aberta ? (
        /* Expandida: logo + nome + botão fechar */
        <div
          style={{
            padding: "12px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            borderBottom: `1px solid ${cor.borda}`,
            minHeight: "64px",
          }}
        >
          {/* Logo mark — substituir src quando a imagem estiver disponível */}
          <div
            style={{
              width: "38px",
              height: "38px",
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
                fontSize: "11px",
                color: "#F2B705",
                letterSpacing: "1px",
              }}
            >
              CDA
            </span>
          </div>

          <div style={{ flex: 1, overflow: "hidden" }}>
            <div
              style={{
                fontFamily: "Anton, sans-serif",
                fontSize: "12px",
                letterSpacing: "2px",
                color: cor.textoPrinc,
                whiteSpace: "nowrap",
              }}
            >
              CÓDIGO DO ASFALTO
            </div>
          </div>

          <button
            onClick={() => setAberta(false)}
            title="Recolher menu"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: cor.texto,
              padding: "4px",
              display: "flex",
              alignItems: "center",
              borderRadius: "6px",
              flexShrink: 0,
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.color = cor.ativo)
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.color = cor.texto)
            }
          >
            <PanelLeftClose size={20} strokeWidth={1.75} />
          </button>
        </div>
      ) : (
        /* Recolhida: apenas o botão de expandir centralizado */
        <div
          style={{
            borderBottom: `1px solid ${cor.borda}`,
            minHeight: "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <button
            onClick={() => setAberta(true)}
            title="Expandir menu"
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
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.color = cor.ativo)
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.color = cor.texto)
            }
          >
            <Menu size={20} strokeWidth={1.75} />
          </button>
        </div>
      )}

      {/* ── Navegação ── */}
      <nav style={{ flex: 1, padding: "8px 0", overflowY: "auto" }}>
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const ativo =
            pathname === href ||
            (href !== "/dashboard" && pathname.startsWith(href + "/"));

          return (
            <button
              key={href}
              onClick={() => navegar(href)}
              title={!aberta ? label : undefined}
              style={navBtn(ativo)}
              onMouseEnter={(e) => {
                if (!ativo)
                  (e.currentTarget as HTMLButtonElement).style.background =
                    cor.hover;
              }}
              onMouseLeave={(e) => {
                if (!ativo)
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "transparent";
              }}
            >
              <Icon
                size={20}
                strokeWidth={ativo ? 2.5 : 1.75}
                style={{ flexShrink: 0 }}
              />
              {aberta && <span>{label}</span>}
            </button>
          );
        })}
      </nav>

      {/* ── Rodapé: fonte · contraste · tema · sair ── */}
      <div style={{ borderTop: `1px solid ${cor.borda}`, padding: "8px 0" }}>

        {/* Tamanho de fonte */}
        {aberta ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "8px 16px",
            }}
          >
            <ALargeSmall
              size={18}
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
                    title={key}
                    style={{
                      background: sel ? "#F2B705" : "transparent",
                      border: `1px solid ${sel ? "#F2B705" : cor.borda}`,
                      borderRadius: "4px",
                      width: "26px",
                      height: "26px",
                      cursor: "pointer",
                      color: sel ? "#0B1F3A" : cor.texto,
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: `${size}px`,
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.15s",
                    }}
                  >
                    A
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAberta(true)}
            title="Tamanho da fonte"
            style={{ ...btnRodape, justifyContent: "center" }}
            onMouseEnter={(e) => onHover(e, true)}
            onMouseLeave={(e) => onHover(e, false)}
          >
            <ALargeSmall size={18} strokeWidth={1.75} style={{ flexShrink: 0 }} />
          </button>
        )}

        {/* Alto contraste */}
        <button
          onClick={toggleAltoContraste}
          title={altoContraste ? "Desativar alto contraste" : "Alto contraste"}
          style={{
            ...btnRodape,
            color: altoContraste ? cor.ativo : cor.texto,
          }}
          onMouseEnter={(e) => onHover(e, true)}
          onMouseLeave={(e) => onHover(e, false)}
        >
          <Contrast
            size={18}
            strokeWidth={1.75}
            style={{ flexShrink: 0 }}
          />
          {aberta && <span>Alto contraste</span>}
        </button>

        {/* Modo claro / escuro */}
        <button
          onClick={toggleTema}
          title={escuro ? "Ativar modo claro" : "Ativar modo escuro"}
          style={btnRodape}
          onMouseEnter={(e) => onHover(e, true)}
          onMouseLeave={(e) => onHover(e, false)}
        >
          {escuro
            ? <Sun  size={18} strokeWidth={1.75} style={{ flexShrink: 0 }} />
            : <Moon size={18} strokeWidth={1.75} style={{ flexShrink: 0 }} />
          }
          {aberta && <span>{escuro ? "Modo claro" : "Modo escuro"}</span>}
        </button>

        {/* Sair */}
        <button
          onClick={sair}
          title="Sair"
          style={btnRodape}
          onMouseEnter={(e) => onHover(e, true)}
          onMouseLeave={(e) => onHover(e, false)}
        >
          <LogOut size={18} strokeWidth={1.75} style={{ flexShrink: 0 }} />
          {aberta && <span>Sair</span>}
        </button>
      </div>
    </aside>
  );
}
