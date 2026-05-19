"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [tema, setTema] = useState<"escuro" | "claro">("escuro");

  const t = {
    escuro: {
      fundo: "#060F1C",
      fundoCard: "#0D1F35",
      fundoEsquerdo:
        "linear-gradient(135deg, #0B1F3A 0%, #060F1C 50%, #0D2847 100%)",
      borda: "#1A3A5C",
      textoPrincipal: "#FFFFFF",
      textoSecundario: "#8FA3B8",
      inputBg: "#0D1F35",
      erroFundo: "rgba(220, 38, 38, 0.1)",
      erroBorda: "rgba(220, 38, 38, 0.3)",
      erroTexto: "#FCA5A5",
    },
    claro: {
      fundo: "#F0F4F8",
      fundoCard: "#FFFFFF",
      fundoEsquerdo: "linear-gradient(135deg, #0B1F3A 0%, #1A3A5C 100%)",
      borda: "#D1D5DB",
      textoPrincipal: "#0B1F3A",
      textoSecundario: "#4A6278",
      inputBg: "#F8FAFC",
      erroFundo: "rgba(220, 38, 38, 0.05)",
      erroBorda: "rgba(220, 38, 38, 0.2)",
      erroTexto: "#DC2626",
    },
  }[tema];

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3001/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha, tenant_id: 1 }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.error || "Erro ao fazer login");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));
      router.push("/dashboard");
    } catch (err) {
      setErro("Erro de conexao com o servidor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Montserrat:wght@400;600;700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-grid {
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

        .form-container {
          width: 100%;
          max-width: 380px;
        }

        .btn-tema {
          position: fixed;
          top: 20px;
          right: 20px;
          background: rgba(242, 183, 5, 0.15);
          border: 1px solid #F2B705;
          border-radius: 50px;
          padding: 8px 16px;
          color: #F2B705;
          font-size: 12px;
          letter-spacing: 1px;
          cursor: pointer;
          z-index: 100;
          font-family: Montserrat, sans-serif;
        }

        @media (max-width: 768px) {
          .login-grid {
            grid-template-columns: 1fr;
          }
          .lado-esquerdo {
            padding: 40px 24px;
            min-height: auto;
          }
          .texto-grande {
            font-size: 36px !important;
          }
          .pilares {
            display: none !important;
          }
          .lado-direito {
            padding: 40px 24px;
          }
        }
      `}</style>

      <button
        className="btn-tema"
        onClick={() => setTema(tema === "escuro" ? "claro" : "escuro")}
      >
        {tema === "escuro" ? "☀️ Claro" : "🌙 Escuro"}
      </button>

      <div
        className="login-grid"
        style={{ background: t.fundo, fontFamily: "Montserrat, sans-serif" }}
      >
        {/* Lado esquerdo */}
        <div className="lado-esquerdo" style={{ background: t.fundoEsquerdo }}>
          {/* Círculos decorativos */}
          {[
            "400px,-100px,-100px",
            "300px,-50px,-50px",
            "350px,auto,auto,-80px,-80px",
          ].map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: i === 0 ? "-100px" : i === 1 ? "-50px" : "auto",
                bottom: i === 2 ? "-80px" : "auto",
                left: i === 0 ? "-100px" : i === 1 ? "-50px" : "auto",
                right: i === 2 ? "-80px" : "auto",
                width: i === 0 ? "400px" : i === 1 ? "300px" : "350px",
                height: i === 0 ? "400px" : i === 1 ? "300px" : "350px",
                borderRadius: "50%",
                border: `1px solid rgba(242, 183, 5, ${i === 0 ? 0.15 : i === 1 ? 0.1 : 0.08})`,
                pointerEvents: "none",
              }}
            />
          ))}

          {/* Logo */}
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
          {/* Texto */}
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
              Plataforma de evolução
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
              NÃO É<br />
              SOBRE
              <br />
              <span style={{ color: "#F2B705" }}>MOTOS.</span>
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
              É SOBRE
              <br />
              <span style={{ color: "#FFFFFF" }}>NÍVEL.</span>
            </h2>
          </div>

          {/* Pilares */}
          <div
            className="pilares"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            {["EVOLUÇÃO", "EXPERIÊNCIA", "COMUNIDADE", "PROPÓSITO"].map(
              (item) => (
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
              ),
            )}
          </div>
        </div>

        {/* Lado direito - Formulário */}
        <div className="lado-direito" style={{ background: t.fundo }}>
          <div className="form-container">
            <div style={{ marginBottom: "40px" }}>
              <h1
                style={{
                  fontFamily: "Anton, sans-serif",
                  fontSize: "34px",
                  color: t.textoPrincipal,
                  letterSpacing: "2px",
                  marginBottom: "8px",
                }}
              >
                BEM-VINDO
              </h1>
              <p style={{ color: t.textoSecundario, fontSize: "14px" }}>
                Acesse sua conta e continue evoluindo
              </p>
            </div>

            <form onSubmit={handleLogin}>
              {/* Email */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "11px",
                    color: tema === "escuro" ? "#F2B705" : "#0B1F3A",
                    fontWeight: tema === "claro" ? "700" : "400",
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    marginBottom: "8px",
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    background: t.inputBg,
                    border: `1px solid ${t.borda}`,
                    borderRadius: "10px",
                    padding: "14px 18px",
                    color: t.textoPrincipal,
                    fontSize: "15px",
                    outline: "none",
                    fontFamily: "Montserrat, sans-serif",
                  }}
                  placeholder="seu@email.com"
                  onFocus={(e) => (e.target.style.borderColor = "#F2B705")}
                  onBlur={(e) => (e.target.style.borderColor = t.borda)}
                />
              </div>

              {/* Senha */}
              <div style={{ marginBottom: "12px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "11px",
                    color: tema === "escuro" ? "#F2B705" : "#0B1F3A",
                    fontWeight: tema === "claro" ? "700" : "400",
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    marginBottom: "8px",
                  }}
                >
                  Senha
                </label>
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    background: t.inputBg,
                    border: `1px solid ${t.borda}`,
                    borderRadius: "10px",
                    padding: "14px 18px",
                    color: t.textoPrincipal,
                    fontSize: "15px",
                    outline: "none",
                    fontFamily: "Montserrat, sans-serif",
                  }}
                  placeholder="••••••••"
                  onFocus={(e) => (e.target.style.borderColor = "#F2B705")}
                  onBlur={(e) => (e.target.style.borderColor = t.borda)}
                />
              </div>

              <div style={{ textAlign: "right", marginBottom: "28px" }}>
                <a
                  href="#"
                  style={{
                    color: t.textoSecundario,
                    fontSize: "13px",
                    textDecoration: "none",
                  }}
                >
                  Esqueceu a senha?
                </a>
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
                    marginBottom: "20px",
                  }}
                >
                  {erro}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  background: loading ? t.borda : "#F2B705",
                  color: loading ? t.textoSecundario : "#0B1F3A",
                  border: "none",
                  borderRadius: "10px",
                  padding: "16px",
                  fontSize: "13px",
                  fontWeight: "800",
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  cursor: loading ? "not-allowed" : "pointer",
                  marginBottom: "16px",
                  fontFamily: "Montserrat, sans-serif",
                }}
              >
                {loading ? "ENTRANDO..." : "ENTRAR"}
              </button>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  marginBottom: "16px",
                }}
              >
                <div style={{ flex: 1, height: "1px", background: t.borda }} />
                <span style={{ color: t.textoSecundario, fontSize: "12px" }}>
                  ou
                </span>
                <div style={{ flex: 1, height: "1px", background: t.borda }} />
              </div>

              {["Google", "Instagram"].map((provider) => (
                <button
                  key={provider}
                  type="button"
                  style={{
                    width: "100%",
                    background: "transparent",
                    color: t.textoPrincipal,
                    border: `1px solid ${t.borda}`,
                    borderRadius: "10px",
                    padding: "13px",
                    fontSize: "13px",
                    letterSpacing: "1px",
                    cursor: "pointer",
                    marginBottom: "10px",
                    fontFamily: "Montserrat, sans-serif",
                  }}
                  onMouseEnter={(e) =>
                    ((e.target as HTMLButtonElement).style.borderColor =
                      "#F2B705")
                  }
                  onMouseLeave={(e) =>
                    ((e.target as HTMLButtonElement).style.borderColor =
                      t.borda)
                  }
                >
                  Continuar com {provider}
                </button>
              ))}
            </form>

            <p
              style={{
                textAlign: "center",
                color: t.textoSecundario,
                fontSize: "12px",
                marginTop: "36px",
                letterSpacing: "1px",
              }}
            >
              Acesso somente por convite
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
