"use client";
import { apiFetch } from "@/lib/api";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTema } from "@/contexts/TemaContext";
import AppLayout from "@/components/AppLayout";

type Canal = "EMAIL" | "WHATSAPP" | "AMBOS";

interface Convite {
  id: number;
  codigo: string;
  email_convidado: string | null;
  celular_convidado: string | null;
  status: string;
  data_expiracao: string;
  data_uso: string | null;
  created_at: string;
}

const STATUS_CONFIG: Record<string, { cor: string; bg: string; label: string }> = {
  PENDENTE: { cor: "#F2B705", bg: "rgba(242,183,5,0.12)", label: "Pendente" },
  USADO: { cor: "#16A34A", bg: "rgba(22,163,74,0.10)", label: "Utilizado" },
  CANCELADO: { cor: "#6B7280", bg: "rgba(107,114,128,0.10)", label: "Cancelado" },
  EXPIRADO: { cor: "#6B7280", bg: "rgba(107,114,128,0.10)", label: "Expirado" },
};

export default function ConvitesPage() {
  const router = useRouter();
  const { t, tema } = useTema();

  const [canal, setCanal] = useState<Canal>("EMAIL");
  const [emailConvidado, setEmailConvidado] = useState("");
  const [celularConvidado, setCelularConvidado] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  const [convites, setConvites] = useState<Convite[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [cancelandoId, setCancelandoId] = useState<number | null>(null);

  const sucBg =
    tema === "escuro" ? "rgba(74,222,128,0.08)" : "rgba(22,163,74,0.08)";
  const sucBorda =
    tema === "escuro" ? "rgba(74,222,128,0.25)" : "rgba(22,163,74,0.25)";
  const sucCor = tema === "escuro" ? "#4ADE80" : "#16A34A";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    carregarConvites();
  }, []);

  async function carregarConvites() {
    setCarregando(true);
    try {
      const res = await apiFetch("/api/v1/convites");
      if (res.ok) setConvites(await res.json());
    } finally {
      setCarregando(false);
    }
  }

  async function enviarConvite(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setSucesso(false);

    setEnviando(true);
    try {
      const body: Record<string, string> = { canal };
      if (canal === "EMAIL" || canal === "AMBOS") body.email_convidado = emailConvidado;
      if (canal === "WHATSAPP" || canal === "AMBOS") body.celular_convidado = celularConvidado;

      const res = await apiFetch("/api/v1/convites", {
        method: "POST",
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErro(data.error || "Erro ao enviar convite");
        return;
      }
      setSucesso(true);
      setEmailConvidado("");
      setCelularConvidado("");
      carregarConvites();
      setTimeout(() => setSucesso(false), 4000);
    } catch {
      setErro("Erro de conexão");
    } finally {
      setEnviando(false);
    }
  }

  async function cancelarConvite(id: number) {
    setCancelandoId(id);
    try {
      const res = await apiFetch(`/api/v1/convites/${id}`, { method: "DELETE" });
      if (res.ok) {
        setConvites((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: "CANCELADO" } : c)),
        );
      }
    } finally {
      setCancelandoId(null);
    }
  }

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "12px",
    fontWeight: 700,
    color: t.textoSecundario,
    letterSpacing: "2px",
    textTransform: "uppercase",
    marginBottom: "8px",
    fontFamily: "Plus Jakarta Sans, sans-serif",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: t.inputBg,
    border: `1px solid ${t.borda}`,
    borderRadius: "10px",
    padding: "14px 18px",
    color: t.textoPrincipal,
    fontSize: "16px",
    outline: "none",
    fontFamily: "Plus Jakarta Sans, sans-serif",
    boxSizing: "border-box",
  };

  const cardStyle: React.CSSProperties = {
    background: t.fundoCard,
    border: `1px solid ${t.borda}`,
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "24px",
  };

  const secaoTitulo: React.CSSProperties = {
    display: "block",
    fontSize: "13px",
    fontWeight: 500,
    letterSpacing: "2px",
    color: t.textoSecundario,
    fontFamily: "Plus Jakarta Sans, sans-serif",
    marginBottom: "20px",
  };

  return (
    <AppLayout titulo="CONVITES">
      <style>{`
        * { box-sizing: border-box; }
        @media (max-width: 1023px) {
          .convites-container { padding: 0 !important; overflow-x: hidden; }
          .convites-card {
            border-radius: 0 !important;
            border-left: none !important;
            border-right: none !important;
            margin-bottom: 0 !important;
          }
        }
      `}</style>
      <div
        style={{
          background: t.fundo,
          color: t.textoPrincipal,
          width: "100%",
          minHeight: "100dvh",
        }}
      >
        <div
          className="convites-container"
          style={{ padding: "32px 24px", width: "100%" }}
        >
          {/* Seção 1 — Enviar convite */}
          <div className="convites-card" style={cardStyle}>
            <span style={secaoTitulo}>ENVIAR CONVITE</span>

            <form onSubmit={enviarConvite}>
              <div style={{ marginBottom: "20px" }}>
                <label style={labelStyle}>Canal</label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {(["EMAIL", "WHATSAPP", "AMBOS"] as Canal[]).map((c) => {
                    const ativo = canal === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCanal(c)}
                        style={{
                          padding: "8px 18px",
                          borderRadius: "8px",
                          border: `1px solid ${ativo ? "#F2B705" : t.borda}`,
                          background: ativo ? "#F2B705" : "transparent",
                          color: ativo ? "#0B1F3A" : t.textoSecundario,
                          fontSize: "13px",
                          fontWeight: ativo ? 700 : 500,
                          cursor: "pointer",
                          fontFamily: "Plus Jakarta Sans, sans-serif",
                          letterSpacing: "1px",
                          transition: "all 0.15s",
                        }}
                      >
                        {c === "EMAIL"
                          ? "E-mail"
                          : c === "WHATSAPP"
                            ? "WhatsApp"
                            : "Ambos"}
                      </button>
                    );
                  })}
                </div>
              </div>

              {(canal === "EMAIL" || canal === "AMBOS") && (
                <div style={{ marginBottom: "16px" }}>
                  <label style={labelStyle}>E-mail do convidado</label>
                  <input
                    type="email"
                    value={emailConvidado}
                    onChange={(e) => setEmailConvidado(e.target.value)}
                    style={inputStyle}
                    placeholder="email@exemplo.com"
                    onFocus={(e) => (e.target.style.borderColor = "#F2B705")}
                    onBlur={(e) => (e.target.style.borderColor = t.borda)}
                  />
                </div>
              )}

              {(canal === "WHATSAPP" || canal === "AMBOS") && (
                <div style={{ marginBottom: "16px" }}>
                  <label style={labelStyle}>WhatsApp do convidado</label>
                  <input
                    type="tel"
                    value={celularConvidado}
                    onChange={(e) => setCelularConvidado(e.target.value)}
                    style={inputStyle}
                    placeholder="5547999999999"
                    onFocus={(e) => (e.target.style.borderColor = "#F2B705")}
                    onBlur={(e) => (e.target.style.borderColor = t.borda)}
                  />
                </div>
              )}

              {erro && (
                <div
                  style={{
                    background: t.erroFundo,
                    border: `1px solid ${t.erroBorda}`,
                    borderRadius: "8px",
                    padding: "12px 16px",
                    color: t.erroTexto,
                    fontSize: "14px",
                    marginBottom: "16px",
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                  }}
                >
                  {erro}
                </div>
              )}

              {sucesso && (
                <div
                  style={{
                    background: sucBg,
                    border: `1px solid ${sucBorda}`,
                    borderRadius: "8px",
                    padding: "12px 16px",
                    color: sucCor,
                    fontSize: "14px",
                    marginBottom: "16px",
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                  }}
                >
                  Convite enviado com sucesso!
                </div>
              )}

              <button
                type="submit"
                disabled={enviando}
                style={{
                  width: "100%",
                  background: "#F2B705",
                  color: "#0B1F3A",
                  border: "none",
                  borderRadius: "10px",
                  padding: "14px",
                  fontSize: "13px",
                  fontWeight: 500,
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  cursor: enviando ? "default" : "pointer",
                  opacity: enviando ? 0.7 : 1,
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                }}
              >
                {enviando ? "ENVIANDO..." : "ENVIAR CONVITE"}
              </button>
            </form>
          </div>

          {/* Seção 2 — Lista de convites */}
          <div className="convites-card" style={cardStyle}>
            <span style={secaoTitulo}>CONVITES ENVIADOS</span>

            {carregando ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "24px 0",
                  color: t.textoSecundario,
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                }}
              >
                Carregando...
              </div>
            ) : convites.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "32px 0",
                  color: t.textoSecundario,
                  fontSize: "15px",
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                }}
              >
                Nenhum convite enviado ainda.
              </div>
            ) : (
              convites.map((convite, i) => {
                const expirado =
                  new Date(convite.data_expiracao) < new Date();
                const statusExibido =
                  expirado && convite.status === "PENDENTE"
                    ? "EXPIRADO"
                    : convite.status;
                const st = STATUS_CONFIG[statusExibido] || {
                  cor: "#6B7280",
                  bg: "rgba(107,114,128,0.10)",
                  label: statusExibido,
                };
                const contato =
                  convite.email_convidado || convite.celular_convidado || "—";

                return (
                  <div
                    key={convite.id}
                    style={{
                      padding: "14px 0",
                      borderTop: i > 0 ? `1px solid ${t.borda}` : "none",
                    }}
                  >
                    {/* Linha 1 — contato */}
                    <div
                      style={{
                        fontSize: "15px",
                        fontWeight: 600,
                        color: t.textoPrincipal,
                        marginBottom: "4px",
                        wordBreak: "break-all",
                        fontFamily: "Plus Jakarta Sans, sans-serif",
                      }}
                    >
                      {contato}
                    </div>

                    {/* Linha 2 — enviado em */}
                    <div
                      style={{
                        fontSize: "12px",
                        color: t.textoSecundario,
                        marginBottom: "8px",
                        fontFamily: "Plus Jakarta Sans, sans-serif",
                      }}
                    >
                      Enviado em{" "}
                      {new Date(convite.created_at).toLocaleDateString("pt-BR")}
                    </div>

                    {/* Linha 3 — expira + badge + botão */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "8px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "12px",
                          color: t.textoSecundario,
                          fontFamily: "Plus Jakarta Sans, sans-serif",
                        }}
                      >
                        Expira em{" "}
                        {new Date(convite.data_expiracao).toLocaleDateString(
                          "pt-BR",
                        )}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          flexShrink: 0,
                        }}
                      >
                        <span
                          style={{
                            padding: "3px 10px",
                            borderRadius: "99px",
                            fontSize: "11px",
                            fontWeight: 600,
                            letterSpacing: "1px",
                            background: st.bg,
                            color: st.cor,
                            border: `1px solid ${st.cor}40`,
                            fontFamily: "Plus Jakarta Sans, sans-serif",
                          }}
                        >
                          {st.label}
                        </span>

                        {convite.status === "PENDENTE" &&
                          statusExibido !== "EXPIRADO" && (
                            <button
                              onClick={() => cancelarConvite(convite.id)}
                              disabled={cancelandoId === convite.id}
                              style={{
                                background: "transparent",
                                border: `1px solid ${t.erroBorda}`,
                                borderRadius: "8px",
                                padding: "6px 12px",
                                fontSize: "12px",
                                color: t.erroTexto,
                                cursor: "pointer",
                                fontFamily: "Plus Jakarta Sans, sans-serif",
                                opacity: cancelandoId === convite.id ? 0.5 : 1,
                              }}
                            >
                              {cancelandoId === convite.id ? "..." : "Cancelar"}
                            </button>
                          )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
