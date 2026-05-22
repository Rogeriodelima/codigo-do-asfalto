"use client";
import { usePathname, useRouter } from "next/navigation";

const itens = [
  { label: "Painel", href: "/dashboard", icone: "⬛" },
  { label: "Experiências", href: "/experiencias", icone: "🏍️" },
  { label: "Timeline", href: "/timeline", icone: "📍" },
  { label: "Evolução", href: "/evolucao", icone: "📈" },
  { label: "Perfil", href: "/perfil", icone: "👤" },
];

export default function NavBottom() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <>
      {/* Nav Bottom — Mobile */}
      <nav style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "64px",
        backgroundColor: "var(--azul)",
        borderTop: "1px solid var(--borda)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        zIndex: 100,
        padding: "0 8px",
      }}
        className="nav-bottom-mobile"
      >
        {itens.map((item) => {
          const ativo = pathname === item.href;
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "2px",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "8px 4px",
                borderRadius: "8px",
                flex: 1,
                color: ativo ? "var(--amarelo)" : "var(--texto-secundario)",
                transition: "color 0.2s",
              }}
            >
              <span style={{ fontSize: "1.3rem" }}>{item.icone}</span>
              <span style={{
                fontSize: "0.6rem",
                fontWeight: ativo ? 700 : 400,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Nav Lateral — Desktop */}
      <nav style={{
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        width: "200px",
        backgroundColor: "var(--azul)",
        borderRight: "1px solid var(--borda)",
        display: "flex",
        flexDirection: "column",
        padding: "24px 0",
        zIndex: 100,
        gap: "4px",
      }}
        className="nav-sidebar-desktop"
      >
        <div style={{
          padding: "0 20px 24px",
          borderBottom: "1px solid var(--borda)",
          marginBottom: "8px",
        }}>
          <div style={{
            fontFamily: "Anton, sans-serif",
            fontSize: "0.75rem",
            letterSpacing: "0.1em",
            color: "var(--amarelo)",
          }}>
            CÓDIGO DO ASFALTO
          </div>
        </div>

        {itens.map((item) => {
          const ativo = pathname === item.href;
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                background: ativo ? "var(--azul-medio)" : "none",
                border: "none",
                borderLeft: ativo ? "3px solid var(--amarelo)" : "3px solid transparent",
                cursor: "pointer",
                padding: "12px 20px",
                color: ativo ? "var(--amarelo)" : "var(--texto-secundario)",
                fontSize: "0.85rem",
                fontWeight: ativo ? 700 : 400,
                textAlign: "left",
                transition: "all 0.2s",
                width: "100%",
              }}
            >
              <span style={{ fontSize: "1.1rem" }}>{item.icone}</span>
              {item.label}
            </button>
          );
        })}
      </nav>
    </>
  );
}