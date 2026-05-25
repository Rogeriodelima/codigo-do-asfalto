"use client";
import { apiFetch } from "@/lib/api";
import { useState, Fragment } from "react";
import { useRouter } from "next/navigation";
import { useTema } from "@/contexts/TemaContext";
import ToggleTema from "@/components/ToggleTema";

export default function CadastroPage() {
  const router = useRouter();
  const { t } = useTema();
  const [etapa, setEtapa] = useState(1);

  // Etapa 1
  const [codigoConvite, setCodigoConvite] = useState("");
  const [email, setEmail] = useState("");
  const [celular, setCelular] = useState("");

  // Etapa 2
  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  // Etapa 3
  const [moto, setMoto] = useState("");

  const [tenantId, setTenantId] = useState<number | null>(null);
  const [nomeTenant, setNomeTenant] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const inputStyle = {
    width: "100%",
    background: t.inputBg,
    border: `1px solid ${t.borda}`,
    borderRadius: "10px",
    padding: "14px 18px",
    color: t.textoPrincipal,
    fontSize: "15px",
    outline: "none",
    fontFamily: "Plus Jakarta Sans, sans-serif",
  };

  const labelStyle = {
    display: "block",
    fontSize: "11px",
    color: t.labelCor,
    fontWeight: t.labelPeso,
    letterSpacing: "2px",
    textTransform: "uppercase" as const,
    marginBottom: "8px",
  };

  const btnPrimario = {
    background: "#F2B705",
    color: "#0B1F3A",
    border: "none",
    borderRadius: "10px",
    padding: "16px",
    fontSize: "13px",
    fontWeight: "800",
    letterSpacing: "3px",
    textTransform: "uppercase" as const,
    cursor: "pointer",
    fontFamily: "Plus Jakarta Sans, sans-serif",
    width: "100%",
  };

  const btnSecundario = {
    background: "transparent",
    color: t.textoPrincipal,
    border: `1px solid ${t.borda}`,
    borderRadius: "10px",
    padding: "16px",
    fontSize: "13px",
    fontWeight: "700",
    letterSpacing: "2px",
    textTransform: "uppercase" as const,
    cursor: "pointer",
    fontFamily: "Plus Jakarta Sans, sans-serif",
    flex: 1,
  };

  function voltar() {
    setErro("");
    setEtapa((e) => e - 1);
  }

  async function handleEtapa1(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);
    try {
      console.log('Enviando:', { codigo: codigoConvite.trim(), email: email.trim() });
      const res = await apiFetch("/api/v1/convites/validar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo: codigoConvite.trim(), email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.error || "Código de convite inválido");
        return;
      }
      setTenantId(data.tenant_id);
      setNomeTenant(data.nome_tenant || "");
      setEtapa(2);
    } catch {
      setErro("Erro de conexão com o servidor");
    } finally {
      setLoading(false);
    }
  }

  function handleEtapa2(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    if (senha.length < 6) {
      setErro("A senha deve ter no mínimo 6 caracteres");
      return;
    }
    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem");
      return;
    }
    setEtapa(3);
  }

  async function submitCadastro() {
    setErro("");
    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        nome,
        email,
        senha,
        codigo_convite: codigoConvite,
        tenant_id: tenantId,
      };
      if (celular) body.celular = celular;
      if (moto) body.moto = moto;

      console.log('Enviando para /api/v1/auth/registro:', body);

      const res = await apiFetch("/api/v1/auth/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.error || "Erro ao criar conta");
        return;
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));
      router.push("/dashboard");
    } catch {
      setErro("Erro de conexão com o servidor");
    } finally {
      setLoading(false);
    }
  }

  function handleCadastro(e: React.FormEvent) {
    e.preventDefault();
    submitCadastro();
  }

  const TITULOS = ["ACESSO POR CONVITE", "SEUS DADOS", "SUA MOTO"];
  const SUBTITULOS = [
    "Informe o código de convite para começar",
    "Como vamos te chamar?",
    "Personalização opcional — pode pular",
  ];

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .cad-grid {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
        }

        .cad-esquerdo {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 60px;
          position: relative;
          overflow: hidden;
        }

        .cad-direito {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px;
          overflow-y: auto;
        }

        .cad-form {
          width: 100%;
          max-width: 380px;
        }

        .pilares {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        @media (max-width: 768px) {
          .cad-grid { grid-template-columns: 1fr; }
          .cad-esquerdo { display: none; }
          .cad-direito { padding: 80px 24px 40px; align-items: flex-start; }
        }
      `}</style>

      <div style={{ position: "fixed", top: "20px", right: "20px", zIndex: 100 }}>
        <ToggleTema />
      </div>

      <div
        className="cad-grid"
        style={{ background: t.fundo, fontFamily: "Plus Jakarta Sans, sans-serif" }}
      >
        {/* ── Lado esquerdo ── */}
        <div className="cad-esquerdo" style={{ background: t.fundoEsquerdo }}>
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

          {/* Logo */}
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

          {/* Tagline */}
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
              Você foi convidado
            </div>
            <h2
              style={{
                fontFamily: "Anton, sans-serif",
                fontSize: "52px",
                lineHeight: "1.1",
                color: "#FFFFFF",
                marginBottom: "16px",
              }}
            >
              CADA
              <br />
              KILÔMETRO
              <br />
              <span style={{ color: "#F2B705" }}>CONTA.</span>
            </h2>
            <h2
              style={{
                fontFamily: "Anton, sans-serif",
                fontSize: "52px",
                lineHeight: "1.1",
                color: "rgba(255,255,255,0.4)",
              }}
            >
              CADA
              <br />
              <span style={{ color: "#FFFFFF" }}>ESCOLHA</span>
              <br />
              TAMBÉM.
            </h2>
          </div>

          {/* Pilares */}
          <div className="pilares">
            {["EVOLUÇÃO", "EXPERIÊNCIA", "COMUNIDADE", "PROPÓSITO"].map((item) => (
              <div
                key={item}
                style={{
                  padding: "10px 14px",
                  border: "1px solid rgba(242,183,5,0.2)",
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

        {/* ── Lado direito ── */}
        <div className="cad-direito" style={{ background: t.fundo }}>
          <div className="cad-form">

            {/* Indicador de etapas */}
            <div style={{ display: "flex", alignItems: "center", marginBottom: "40px" }}>
              {[1, 2, 3].map((n, i) => (
                <Fragment key={n}>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: "700",
                      flexShrink: 0,
                      background: n <= etapa ? "#F2B705" : t.inputBg,
                      color: n <= etapa ? "#0B1F3A" : t.textoSecundario,
                      border: n > etapa ? `1px solid ${t.borda}` : "none",
                      transition: "all 0.3s",
                    }}
                  >
                    {n < etapa ? "✓" : n}
                  </div>
                  {i < 2 && (
                    <div
                      style={{
                        flex: 1,
                        height: "1px",
                        background: n < etapa ? "#F2B705" : t.borda,
                        transition: "background 0.3s",
                      }}
                    />
                  )}
                </Fragment>
              ))}
            </div>

            {/* Cabeçalho da etapa */}
            <div style={{ marginBottom: "32px" }}>
              <div
                style={{
                  fontSize: "11px",
                  color: "#F2B705",
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                }}
              >
                Etapa {etapa} de 3
              </div>
              <h1
                style={{
                  fontFamily: "Anton, sans-serif",
                  fontSize: "28px",
                  color: t.textoPrincipal,
                  letterSpacing: "2px",
                  marginBottom: "6px",
                }}
              >
                {TITULOS[etapa - 1]}
              </h1>
              <p style={{ color: t.textoSecundario, fontSize: "14px" }}>
                {SUBTITULOS[etapa - 1]}
                {etapa === 1 && nomeTenant && (
                  <span style={{ color: "#F2B705", fontWeight: "700" }}>
                    {" "}
                    — {nomeTenant}
                  </span>
                )}
              </p>
            </div>

            {/* Mensagem de erro */}
            {erro && (
              <div
                style={{
                  background: t.erroFundo,
                  border: `1px solid ${t.erroBorda}`,
                  borderRadius: "8px",
                  padding: "12px 16px",
                  color: t.erroTexto,
                  fontSize: "14px",
                  marginBottom: "20px",
                }}
              >
                {erro}
              </div>
            )}

            {/* ── ETAPA 1: convite + email + celular ── */}
            {etapa === 1 && (
              <form onSubmit={handleEtapa1}>
                <div style={{ marginBottom: "20px" }}>
                  <label style={labelStyle}>Código de convite</label>
                  <input
                    type="text"
                    value={codigoConvite}
                    onChange={(e) => setCodigoConvite(e.target.value.toUpperCase())}
                    required
                    style={inputStyle}
                    placeholder="Ex.: ASFALTO-2024"
                    onFocus={(e) => (e.target.style.borderColor = "#F2B705")}
                    onBlur={(e) => (e.target.style.borderColor = t.borda)}
                  />
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={labelStyle}>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={inputStyle}
                    placeholder="seu@email.com"
                    onFocus={(e) => (e.target.style.borderColor = "#F2B705")}
                    onBlur={(e) => (e.target.style.borderColor = t.borda)}
                  />
                </div>

                <div style={{ marginBottom: "32px" }}>
                  <label style={labelStyle}>
                    Celular{" "}
                    <span
                      style={{
                        color: t.textoSecundario,
                        fontWeight: "normal",
                        letterSpacing: "0",
                        textTransform: "none",
                      }}
                    >
                      — opcional
                    </span>
                  </label>
                  <input
                    type="tel"
                    value={celular}
                    onChange={(e) => setCelular(e.target.value)}
                    style={inputStyle}
                    placeholder="(11) 99999-9999"
                    onFocus={(e) => (e.target.style.borderColor = "#F2B705")}
                    onBlur={(e) => (e.target.style.borderColor = t.borda)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    ...btnPrimario,
                    opacity: loading ? 0.6 : 1,
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  {loading ? "VALIDANDO..." : "PRÓXIMO →"}
                </button>
              </form>
            )}

            {/* ── ETAPA 2: nome + senha ── */}
            {etapa === 2 && (
              <form onSubmit={handleEtapa2}>
                <div style={{ marginBottom: "20px" }}>
                  <label style={labelStyle}>Nome completo</label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                    style={inputStyle}
                    placeholder="Seu nome"
                    onFocus={(e) => (e.target.style.borderColor = "#F2B705")}
                    onBlur={(e) => (e.target.style.borderColor = t.borda)}
                  />
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={labelStyle}>Senha</label>
                  <input
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                    style={inputStyle}
                    placeholder="Mínimo 6 caracteres"
                    onFocus={(e) => (e.target.style.borderColor = "#F2B705")}
                    onBlur={(e) => (e.target.style.borderColor = t.borda)}
                  />
                </div>

                <div style={{ marginBottom: "32px" }}>
                  <label style={labelStyle}>Confirmar senha</label>
                  <input
                    type="password"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    required
                    style={inputStyle}
                    placeholder="Repita a senha"
                    onFocus={(e) => (e.target.style.borderColor = "#F2B705")}
                    onBlur={(e) => (e.target.style.borderColor = t.borda)}
                  />
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    type="button"
                    onClick={voltar}
                    style={btnSecundario}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.borderColor = "#F2B705")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.borderColor = t.borda)
                    }
                  >
                    ← VOLTAR
                  </button>
                  <button
                    type="submit"
                    style={{ ...btnPrimario, flex: 2, width: "auto" }}
                  >
                    PRÓXIMO →
                  </button>
                </div>
              </form>
            )}

            {/* ── ETAPA 3: moto + nível ── */}
            {etapa === 3 && (
              <form onSubmit={handleCadastro}>
                <div style={{ marginBottom: "20px" }}>
                  <label style={labelStyle}>
                    Sua moto{" "}
                    <span
                      style={{
                        color: t.textoSecundario,
                        fontWeight: "normal",
                        letterSpacing: "0",
                        textTransform: "none",
                      }}
                    >
                      — opcional
                    </span>
                  </label>
                  <input
                    type="text"
                    value={moto}
                    onChange={(e) => setMoto(e.target.value)}
                    style={inputStyle}
                    placeholder="Ex.: Honda CB 500, BMW R1250GS"
                    onFocus={(e) => (e.target.style.borderColor = "#F2B705")}
                    onBlur={(e) => (e.target.style.borderColor = t.borda)}
                  />
                </div>

                <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
                  <button
                    type="button"
                    onClick={voltar}
                    style={btnSecundario}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.borderColor = "#F2B705")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.borderColor = t.borda)
                    }
                  >
                    ← VOLTAR
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      ...btnPrimario,
                      flex: 2,
                      width: "auto",
                      opacity: loading ? 0.6 : 1,
                      cursor: loading ? "not-allowed" : "pointer",
                    }}
                  >
                    {loading ? "CRIANDO..." : "CRIAR CONTA"}
                  </button>
                </div>

                <div style={{ textAlign: "center" }}>
                  <button
                    type="button"
                    onClick={submitCadastro}
                    disabled={loading}
                    style={{
                      background: "none",
                      border: "none",
                      color: t.textoSecundario,
                      fontSize: "12px",
                      cursor: "pointer",
                      letterSpacing: "1px",
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                    }}
                  >
                    Pular esta etapa e criar conta →
                  </button>
                </div>
              </form>
            )}

            {/* Link para login */}
            <p
              style={{
                textAlign: "center",
                color: t.textoSecundario,
                fontSize: "12px",
                marginTop: "32px",
                letterSpacing: "1px",
              }}
            >
              Já tem conta?{" "}
              <a
                href="/login"
                style={{ color: "#F2B705", textDecoration: "none", fontWeight: "700" }}
              >
                Fazer login
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
