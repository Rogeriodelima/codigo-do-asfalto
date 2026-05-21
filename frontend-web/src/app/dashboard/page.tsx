"use client";
import { apiFetch } from "@/lib/api";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTema } from "@/contexts/TemaContext";
import ToggleTema from "@/components/ToggleTema";
import PainelAcessibilidade from "@/components/PainelAcessibilidade";

interface DashboardData {
  usuario: { nome: string; foto_url: string | null };
  nivel: {
    atual: number;
    nome: string;
    progresso: number;
    pontuacao: number;
    pontos_para_proximo: number;
    proximo: string;
  };
  stats: {
    total_experiencias: number;
    pendentes_validacao: number;
    equipamentos: number;
    experiencias_validadas: number;
  };
  ultimas_experiencias: Array<{
    id: number;
    tipo: string;
    titulo: string;
    data: string;
    status_validacao: string;
    pontuacao: number | null;
  }>;
}

const STATUS_CONFIG: Record<string, { cor: string; label: string }> = {
  EM_APROVACAO: { cor: "#D97706", label: "Em aprovação" },
  VALIDADA: { cor: "#16A34A", label: "Validada" },
  VALIDADA_DESTAQUE: { cor: "#16A34A", label: "Destaque" },
  EM_REVISAO: { cor: "#3B82F6", label: "Em revisão" },
  REJEITADA: { cor: "#DC2626", label: "Rejeitada" },
};

const NIVEL_CORES = ["", "#6B7280", "#D97706", "#F97316", "#A855F7", "#16A34A"];

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useTema();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    apiFetch("/api/v1/evolucao/dashboard", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401) {
          router.push("/login");
          return null;
        }
        return res.json();
      })
      .then((json) => {
        if (json) setData(json);
      })
      .catch(() => setErro("Erro ao carregar dashboard"))
      .finally(() => setLoading(false));
  }, [router]);

  function sair() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    router.push("/login");
  }

  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: t.fundo,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: t.destaque,
          fontFamily: "Anton, sans-serif",
          fontSize: "1.25rem",
          letterSpacing: "3px",
        }}
      >
        CARREGANDO...
      </div>
    );

  if (erro || !data)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: t.fundo,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: t.erroTexto,
          fontFamily: "Plus Jakarta Sans, sans-serif",
        }}
      >
        {erro || "Erro ao carregar dados"}
      </div>
    );

  return (
    <>
      <style>{`
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .dashboard { min-height: 100vh; font-family: Plus Jakarta Sans, sans-serif; }
        .topbar {
          border-bottom: 1px solid ${t.borda};
          padding: 16px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .conteudo { padding: 32px; max-width: 1200px; margin: 0 auto; }
        .grid-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 32px;
        }
        .grid-principal { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .card { border: 1px solid ${t.borda}; border-radius: 16px; padding: 24px; }
        .barra-progresso {
          height: 8px;
          background: ${t.borda};
          border-radius: 99px;
          overflow: hidden;
          margin: 12px 0;
        }
        .barra-preenchida {
          height: 100%;
          background: linear-gradient(90deg, #F2B705, #F97316);
          border-radius: 99px;
          transition: width 1s ease;
        }
        .btn-nav {
          background: transparent;
          border: none;
          color: ${t.destaque};
          font-size: 12px;
          cursor: pointer;
          letter-spacing: 1px;
          font-family: Plus Jakarta Sans, sans-serif;
          font-weight: 700;
        }
        .exp-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 0;
          border-bottom: 1px solid ${t.borda};
        }
        .exp-item:last-child { border-bottom: none; }
        .badge-status {
          padding: 4px 10px;
          border-radius: 99px;
          font-size: 10px;
          letter-spacing: 1px;
          font-weight: 600;
        }
        @media (max-width: 768px) {
          .topbar { padding: 16px; }
          .conteudo { padding: 16px; }
          .grid-stats { grid-template-columns: 1fr 1fr; }
          .grid-principal { grid-template-columns: 1fr; }
        }
      `}</style>

      <div
        className="dashboard"
        style={{ background: t.fundo, color: t.textoPrincipal }}
      >
        {/* Topbar */}
        <div className="topbar" style={{ background: t.fundoTopbar }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{ width: "3px", height: "32px", background: "#F2B705" }}
            />
            <div>
              <div
                style={{
                  fontFamily: "Anton, sans-serif",
                  fontSize: "1rem",
                  letterSpacing: "3px",
                  color: t.textoPrincipal,
                }}
              >
                CÓDIGO DO ASFALTO
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: t.textoSecundario,
                  letterSpacing: "2px",
                  fontWeight: "600",
                }}
              >
                PAINEL DO PILOTO
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <PainelAcessibilidade />
            <ToggleTema />
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: "1rem",
                  fontWeight: "700",
                  color: t.textoPrincipal,
                }}
              >
                {data.usuario.nome}
              </div>
              <div
                style={{
                  fontSize: "0.8125rem",
                  color: t.destaque,
                  letterSpacing: "1px",
                  fontWeight: "600",
                }}
              >
                Nível {data.nivel.atual} — {data.nivel.nome}
              </div>
            </div>
            <button
              onClick={sair}
              style={{
                background: "transparent",
                border: `1px solid ${t.borda}`,
                borderRadius: "8px",
                padding: "8px 16px",
                color: t.textoSecundario,
                fontSize: "0.8125rem",
                letterSpacing: "1px",
                cursor: "pointer",
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: "600",
              }}
            >
              SAIR
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="conteudo">
          <div style={{ marginBottom: "32px" }}>
            <h1
              style={{
                fontFamily: "Anton, sans-serif",
                fontSize: "1.75rem",
                letterSpacing: "2px",
                marginBottom: "4px",
                color: t.textoPrincipal,
              }}
            >
              OLÁ, {data.usuario.nome.toUpperCase()}
            </h1>
            <p
              style={{
                color: t.textoSecundario,
                fontSize: "1rem",
                fontWeight: "500",
              }}
            >
              Acompanhe sua evolução e registre novas experiências
            </p>
          </div>

          {/* Stats */}
          <div className="grid-stats">
            {[
              {
                label: "EXPERIÊNCIAS",
                valor: data.stats.total_experiencias,
                cor: "#D97706",
              },
              {
                label: "VALIDADAS",
                valor: data.stats.experiencias_validadas,
                cor: "#16A34A",
              },
              {
                label: "PENDENTES",
                valor: data.stats.pendentes_validacao,
                cor: "#3B82F6",
              },
              {
                label: "EQUIPAMENTOS",
                valor: data.stats.equipamentos,
                cor: "#7C3AED",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="card"
                style={{ background: t.fundoCard, textAlign: "center" }}
              >
                <div
                  style={{
                    fontSize: "2.25rem",
                    fontFamily: "Anton, sans-serif",
                    color: stat.cor,
                    letterSpacing: "2px",
                  }}
                >
                  {stat.valor}
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: t.textoSecundario,
                    letterSpacing: "2px",
                    marginTop: "4px",
                    fontWeight: "700",
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Grid principal */}
          <div className="grid-principal">
            {/* Card nível */}
            <div className="card" style={{ background: t.fundoCard }}>
              <div
                style={{
                  fontSize: "0.8125rem",
                  color: t.textoSecundario,
                  letterSpacing: "2px",
                  marginBottom: "20px",
                  fontWeight: "700",
                }}
              >
                SEU NÍVEL ATUAL
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "12px",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{
                    fontFamily: "Anton, sans-serif",
                    fontSize: "4rem",
                    color: NIVEL_CORES[data.nivel.atual] || "#D97706",
                    lineHeight: "1",
                  }}
                >
                  {data.nivel.atual}
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "Anton, sans-serif",
                      fontSize: "1.375rem",
                      color: t.textoPrincipal,
                      letterSpacing: "2px",
                    }}
                  >
                    {data.nivel.nome.toUpperCase()}
                  </div>
                  <div
                    style={{
                      fontSize: "0.8125rem",
                      color: t.textoSecundario,
                      fontWeight: "500",
                    }}
                  >
                    {data.nivel.pontuacao} pontos acumulados
                  </div>
                </div>
              </div>

              <div className="barra-progresso">
                <div
                  className="barra-preenchida"
                  style={{ width: `${data.nivel.progresso}%` }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.8125rem",
                  color: t.textoSecundario,
                  fontWeight: "500",
                }}
              >
                <span>{data.nivel.progresso}% concluído</span>
                <span>
                  {data.nivel.pontos_para_proximo > 0
                    ? `${data.nivel.pontos_para_proximo} pts para ${data.nivel.proximo}`
                    : "Nível máximo!"}
                </span>
              </div>

              <div
                style={{
                  marginTop: "24px",
                  padding: "16px",
                  background: t.fundoProximo,
                  borderRadius: "12px",
                  border: `1px solid ${t.bordaProximo}`,
                }}
              >
                <div
                  style={{
                    fontSize: "0.8125rem",
                    color: t.destaque,
                    letterSpacing: "1px",
                    marginBottom: "8px",
                    fontWeight: "700",
                  }}
                >
                  PRÓXIMO PASSO
                </div>
                <div
                  style={{
                    fontSize: "1rem",
                    color: t.textoPrincipal,
                    fontWeight: "500",
                  }}
                >
                  Registre mais experiências para avançar para{" "}
                  {data.nivel.proximo}
                </div>
              </div>
            </div>

            {/* Últimas experiências */}
            <div className="card" style={{ background: t.fundoCard }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    fontSize: "0.8125rem",
                    color: t.textoSecundario,
                    letterSpacing: "2px",
                    fontWeight: "700",
                  }}
                >
                  ÚLTIMAS EXPERIÊNCIAS
                </div>
                <button
                  className="btn-nav"
                  onClick={() => router.push("/experiencias")}
                >
                  VER TODAS →
                </button>
              </div>

              {data.ultimas_experiencias.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px 0",
                    color: t.textoSecundario,
                    fontSize: "1rem",
                  }}
                >
                  Nenhuma experiência registrada ainda.
                </div>
              ) : (
                data.ultimas_experiencias.map((exp) => {
                  const status = STATUS_CONFIG[exp.status_validacao] || {
                    cor: "#8FA3B8",
                    label: exp.status_validacao,
                  };
                  return (
                    <div key={exp.id} className="exp-item">
                      <div>
                        <div
                          style={{
                            fontSize: "1rem",
                            fontWeight: "600",
                            marginBottom: "4px",
                            color: t.textoPrincipal,
                          }}
                        >
                          {exp.titulo}
                        </div>
                        <div
                          style={{
                            fontSize: "0.8125rem",
                            color: t.textoSecundario,
                            fontWeight: "500",
                          }}
                        >
                          {exp.tipo} ·{" "}
                          {new Date(exp.data).toLocaleDateString("pt-BR")}
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        {exp.pontuacao && (
                          <div
                            style={{
                              fontSize: "0.8125rem",
                              fontWeight: "700",
                              color: t.destaque,
                            }}
                          >
                            +{exp.pontuacao}pts
                          </div>
                        )}
                        <div
                          className="badge-status"
                          style={{
                            background: `${status.cor}20`,
                            color: status.cor,
                            border: `1px solid ${status.cor}40`,
                          }}
                        >
                          {status.label}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
