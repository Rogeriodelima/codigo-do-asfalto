"use client";
import { apiFetch } from "@/lib/api";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTema } from "@/contexts/TemaContext";
import ToggleTema from "@/components/ToggleTema";

export default function LoginPage() {
  const router = useRouter();
  const { tema, t } = useTema();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const res = await apiFetch("/api/v1/auth/login", {
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

        .btn-tema-fixo {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 100;
        }

        .pilares {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        @media (max-width: 768px) {
          .login-grid { grid-template-columns: 1fr; }
          .lado-esquerdo { padding: 40px 24px; min-height: auto; }
          .texto-grande { font-size: 36px !important; }
          .pilares { display: none !important; }
          .lado-direito { padding: 40px 24px; }
        }
      `}</style>

      <div className="btn-tema-fixo">
        <ToggleTema />
      </div>

      <div
        className="login-grid"
        style={{
          background: t.fundo,
          fontFamily: "Plus Jakarta Sans, sans-serif",
        }}
      >
        {/* Lado esquerdo */}
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

          {/* Logo */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{ width: "4px", height: "48px", background: "#F2B705" }}
              />
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

          {/* Texto central */}
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
          <div className="pilares">
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

        {/* Lado direito */}
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
                    color: t.labelCor,
                    fontWeight: t.labelPeso,
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
                    fontFamily: "Plus Jakarta Sans, sans-serif",
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
                    color: t.labelCor,
                    fontWeight: t.labelPeso,
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
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                  }}
                  placeholder="••••••••"
                  onFocus={(e) => (e.target.style.borderColor = "#F2B705")}
                  onBlur={(e) => (e.target.style.borderColor = t.borda)}
                />
              </div>

              <div style={{ textAlign: "right", marginBottom: "28px" }}>
                <a
                  href="/recuperar-senha"
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
                  fontFamily: "Plus Jakarta Sans, sans-serif",
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
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = "#F2B705")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = t.borda)
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
