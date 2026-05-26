"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTema } from "@/contexts/TemaContext";
import { apiFetch } from "@/lib/api";
import ToggleTema from "@/components/ToggleTema";

interface Tenant {
  id: number;
  nome: string;
  logo?: string | null;
}

export default function SelecionarTenantPage() {
  const router = useRouter();
  const { t } = useTema();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [selecionando, setSelecionando] = useState<number | null>(null);
  const [logoErrors, setLogoErrors] = useState<Set<number>>(new Set());

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    carregarTenants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function carregarTenants() {
    try {
      const res = await apiFetch("/api/v1/usuarios/me/tenants");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErro(data.error || "Erro ao carregar organizações");
        return;
      }
      const data = await res.json();
      const lista: Tenant[] = Array.isArray(data) ? data : (data.tenants ?? []);
      if (lista.length === 1) {
        localStorage.setItem("tenant_id", String(lista[0].id));
        router.replace("/dashboard");
        return;
      }
      if (lista.length === 0) {
        setErro("Nenhuma organização encontrada. Entre em contato com o suporte.");
        return;
      }
      setTenants(lista);
    } catch {
      setErro("Erro de conexão com o servidor");
    } finally {
      setCarregando(false);
    }
  }

  function selecionarTenant(id: number) {
    if (selecionando) return;
    setSelecionando(id);
    localStorage.setItem("tenant_id", String(id));
    router.push("/dashboard");
  }

  function marcarLogoErro(id: number) {
    setLogoErrors((prev) => new Set([...prev, id]));
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .tenant-grid {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
        }

        .lado-esquerdo {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 60px;
          position: relative;
          overflow: hidden;
        }

        .lado-direito {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px;
        }

        .conteudo-direito {
          width: 100%;
          max-width: 480px;
        }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(148px, 1fr));
          gap: 16px;
          margin-top: 32px;
        }

        .btn-tema-fixo {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 100;
        }

        .tenant-card {
          transition: transform 0.15s, box-shadow 0.15s;
        }

        .tenant-card:hover:not(.desabilitado) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        }

        .pilares {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .tenant-grid { grid-template-columns: 1fr; }
          .lado-esquerdo { padding: 40px 24px; min-height: auto; }
          .lado-direito { padding: 40px 24px; align-items: flex-start; }
          .texto-grande { font-size: 36px !important; }
          .pilares { display: none !important; }
          .cards-grid { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); }
        }
      `}</style>

      <div className="btn-tema-fixo">
        <ToggleTema />
      </div>

      <div
        className="tenant-grid"
        style={{ background: t.fundo, fontFamily: "Plus Jakarta Sans, sans-serif" }}
      >
        {/* Lado esquerdo — branding */}
        <div className="lado-esquerdo" style={{ background: t.fundoEsquerdo }}>
          <div
            style={{
              width: "3px",
              height: "300px",
              background: "rgba(242,183,5,0.1)",
              position: "absolute",
              top: 0,
              right: 0,
            }}
          />

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "4px", height: "48px", background: "#F2B705" }} />
              <div style={{ lineHeight: "1.1" }}>
                <div
                  style={{
                    fontFamily: "Anton, sans-serif",
                    fontSize: "28px",
                    color: "#FFFFFF",
                    letterSpacing: "4px",
                  }}
                >
                  CÓDIGO DO
                </div>
                <div
                  style={{
                    fontFamily: "Anton, sans-serif",
                    fontSize: "28px",
                    color: "#F2B705",
                    letterSpacing: "4px",
                  }}
                >
                  ASFALTO
                </div>
              </div>
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: "11px",
                color: "#F2B705",
                letterSpacing: "4px",
                textTransform: "uppercase",
                marginBottom: "24px",
              }}
            >
              Selecione seu espaço
            </div>
            <h2
              className="texto-grande"
              style={{
                fontFamily: "Anton, sans-serif",
                fontSize: "52px",
                lineHeight: "1.1",
                color: "#FFFFFF",
                marginBottom: "16px",
              }}
            >
              MAIS DE
              <br />
              UM
              <br />
              <span style={{ color: "#F2B705" }}>DESTINO.</span>
            </h2>
            <h2
              className="texto-grande"
              style={{
                fontFamily: "Anton, sans-serif",
                fontSize: "52px",
                lineHeight: "1.1",
                color: "rgba(255,255,255,0.4)",
              }}
            >
              VOCÊ
              <br />
              ESCOLHE
              <br />
              <span style={{ color: "#FFFFFF" }}>AGORA.</span>
            </h2>
          </div>

          <div className="pilares">
            {["EVOLUÇÃO", "EXPERIÊNCIA", "COMUNIDADE", "PROPÓSITO"].map((item) => (
              <div
                key={item}
                style={{
                  padding: "10px 14px",
                  border: "1px solid rgba(242, 183, 5, 0.2)",
                  borderRadius: "8px",
                  fontSize: "10px",
                  letterSpacing: "2px",
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Lado direito — seleção */}
        <div className="lado-direito" style={{ background: t.fundo }}>
          <div className="conteudo-direito">
            <div>
              <h1
                style={{
                  fontFamily: "Anton, sans-serif",
                  fontSize: "34px",
                  color: t.textoPrincipal,
                  letterSpacing: "2px",
                  marginBottom: "8px",
                }}
              >
                ESCOLHA SEU ESPAÇO
              </h1>
              <p style={{ color: t.textoSecundario, fontSize: "14px" }}>
                Você tem acesso a mais de uma organização. Selecione para continuar.
              </p>
            </div>

            {erro && (
              <div
                style={{
                  background: t.erroFundo,
                  border: `1px solid ${t.erroBorda}`,
                  borderRadius: "8px",
                  padding: "12px 16px",
                  color: t.erroTexto,
                  fontSize: "14px",
                  marginTop: "24px",
                }}
              >
                {erro}
              </div>
            )}

            {carregando ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "12px",
                  marginTop: "48px",
                  color: t.textoSecundario,
                  fontSize: "14px",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    border: `3px solid ${t.borda}`,
                    borderTopColor: "#F2B705",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                Carregando organizações...
              </div>
            ) : (
              <div className="cards-grid">
                {tenants.map((tenant) => (
                  <div
                    key={tenant.id}
                    className={`tenant-card${selecionando ? " desabilitado" : ""}`}
                    onClick={() => selecionarTenant(tenant.id)}
                    style={{
                      background: t.fundoCard,
                      border: `1px solid ${selecionando === tenant.id ? "#F2B705" : t.borda}`,
                      borderRadius: "12px",
                      padding: "20px 16px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "12px",
                      opacity: selecionando && selecionando !== tenant.id ? 0.5 : 1,
                      cursor: selecionando ? "default" : "pointer",
                      transition: "border-color 0.15s, opacity 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      if (!selecionando)
                        e.currentTarget.style.borderColor = "#F2B705";
                    }}
                    onMouseLeave={(e) => {
                      if (selecionando !== tenant.id)
                        e.currentTarget.style.borderColor = t.borda;
                    }}
                  >
                    {tenant.logo && !logoErrors.has(tenant.id) ? (
                      <img
                        src={tenant.logo}
                        alt={tenant.nome}
                        onError={() => marcarLogoErro(tenant.id)}
                        style={{
                          width: "64px",
                          height: "64px",
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: `2px solid ${t.borda}`,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "64px",
                          height: "64px",
                          borderRadius: "50%",
                          background: "#0B1F3A",
                          border: "2px solid #F2B705",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: "Anton, sans-serif",
                          fontSize: "24px",
                          color: "#F2B705",
                          flexShrink: 0,
                        }}
                      >
                        {tenant.nome.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div
                      style={{
                        textAlign: "center",
                        fontSize: "13px",
                        fontWeight: "600",
                        color: t.textoPrincipal,
                        lineHeight: "1.3",
                        wordBreak: "break-word",
                        width: "100%",
                      }}
                    >
                      {tenant.nome}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        selecionarTenant(tenant.id);
                      }}
                      disabled={!!selecionando}
                      style={{
                        width: "100%",
                        background: selecionando === tenant.id ? t.borda : "#F2B705",
                        color:
                          selecionando === tenant.id
                            ? t.textoSecundario
                            : "#0B1F3A",
                        border: "none",
                        borderRadius: "8px",
                        padding: "10px",
                        fontSize: "11px",
                        fontWeight: "800",
                        letterSpacing: "2px",
                        textTransform: "uppercase",
                        cursor: selecionando ? "default" : "pointer",
                        fontFamily: "Plus Jakarta Sans, sans-serif",
                      }}
                    >
                      {selecionando === tenant.id ? "ENTRANDO..." : "SELECIONAR"}
                    </button>
                  </div>
                ))}
              </div>
            )}

            <p
              style={{
                textAlign: "center",
                color: t.textoSecundario,
                fontSize: "12px",
                marginTop: "36px",
                letterSpacing: "1px",
              }}
            >
              <a
                href="/login"
                style={{ color: t.textoSecundario, textDecoration: "none" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "#F2B705")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = t.textoSecundario)
                }
              >
                Voltar ao login
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
