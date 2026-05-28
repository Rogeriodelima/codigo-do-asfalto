"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTema } from "@/contexts/TemaContext";
import { apiFetch } from "@/lib/api";
import AppLayout from "@/components/AppLayout";

interface Perfil {
  id: number;
  nome: string;
  nome_exibido: string | null;
  email: string;
  celular: string | null;
  foto_url: string | null;
  nivel_atual: number;
  tenant: { id: number; nome: string };
}

interface Moto {
  id: number;
  modelo: string;
  categoria: string | null;
  ano: number | null;
  cor: string | null;
  identificador: string | null;
}

interface FormMoto {
  id?: number;
  modelo: string;
  categoria: string;
  ano: string;
  cor: string;
  identificador: string;
}

const FORM_MOTO_VAZIO: FormMoto = {
  modelo: "",
  categoria: "",
  ano: "",
  cor: "",
  identificador: "",
};

export default function PerfilPage() {
  const router = useRouter();
  const { t, tema } = useTema();

  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [motos, setMotos] = useState<Moto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroGlobal, setErroGlobal] = useState("");

  const [formNome, setFormNome] = useState("");
  const [formNomeExibido, setFormNomeExibido] = useState("");
  const [formCelular, setFormCelular] = useState("");
  const [salvandoPerfil, setSalvandoPerfil] = useState(false);
  const [erroPerfil, setErroPerfil] = useState("");
  const [sucessoPerfil, setSucessoPerfil] = useState(false);

  const [formMoto, setFormMoto] = useState<FormMoto | null>(null);
  const [salvandoMoto, setSalvandoMoto] = useState(false);
  const [erroMoto, setErroMoto] = useState("");
  const [removendoId, setRemovendoId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    carregarDados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function carregarDados() {
    setCarregando(true);
    try {
      const [resPerfil, resMotos] = await Promise.all([
        apiFetch("/api/v1/perfil"),
        apiFetch("/api/v1/equipamentos"),
      ]);

      if (!resPerfil.ok) {
        setErroGlobal("Erro ao carregar perfil");
        return;
      }

      const dadosPerfil: Perfil = await resPerfil.json();
      setPerfil(dadosPerfil);
      setFormNome(dadosPerfil.nome ?? "");
      setFormNomeExibido(dadosPerfil.nome_exibido ?? "");
      setFormCelular(dadosPerfil.celular ?? "");

      if (resMotos.ok) setMotos(await resMotos.json());
    } catch {
      setErroGlobal("Erro de conexão com o servidor");
    } finally {
      setCarregando(false);
    }
  }

  async function salvarPerfil(e: React.FormEvent) {
    e.preventDefault();
    setErroPerfil("");
    setSucessoPerfil(false);
    setSalvandoPerfil(true);
    try {
      const res = await apiFetch("/api/v1/perfil", {
        method: "PUT",
        body: JSON.stringify({
          nome: formNome || undefined,
          nome_exibido: formNomeExibido || undefined,
          celular: formCelular || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErroPerfil(data.error || "Erro ao salvar");
        return;
      }
      setSucessoPerfil(true);
      setPerfil((p) =>
        p
          ? {
              ...p,
              nome: formNome,
              nome_exibido: formNomeExibido || null,
              celular: formCelular || null,
            }
          : p,
      );
      setTimeout(() => setSucessoPerfil(false), 3000);
    } catch {
      setErroPerfil("Erro de conexão com o servidor");
    } finally {
      setSalvandoPerfil(false);
    }
  }

  async function salvarMoto(e: React.FormEvent) {
    e.preventDefault();
    if (!formMoto) return;
    setErroMoto("");
    setSalvandoMoto(true);
    try {
      const body = {
        modelo: formMoto.modelo,
        categoria: formMoto.categoria || undefined,
        ano: formMoto.ano ? parseInt(formMoto.ano, 10) : undefined,
        cor: formMoto.cor || undefined,
        identificador: formMoto.identificador || undefined,
        tipo_produto: "MOTO",
      };

      const isEdicao = !!formMoto.id;
      const res = await apiFetch(
        isEdicao
          ? `/api/v1/equipamentos/${formMoto.id}`
          : "/api/v1/equipamentos",
        { method: isEdicao ? "PUT" : "POST", body: JSON.stringify(body) },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErroMoto(data.error || "Erro ao salvar moto");
        return;
      }

      setFormMoto(null);
      const resMotos = await apiFetch("/api/v1/equipamentos");
      if (resMotos.ok) setMotos(await resMotos.json());
    } catch {
      setErroMoto("Erro de conexão com o servidor");
    } finally {
      setSalvandoMoto(false);
    }
  }

  async function removerMoto(id: number) {
    setRemovendoId(id);
    try {
      const res = await apiFetch(`/api/v1/equipamentos/${id}`, {
        method: "DELETE",
      });
      if (res.ok) setMotos((prev) => prev.filter((m) => m.id !== id));
    } catch {
      // silencia
    } finally {
      setRemovendoId(null);
    }
  }

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "11px",
    color: t.labelCor,
    fontWeight: t.labelPeso,
    letterSpacing: "2px",
    textTransform: "uppercase",
    marginBottom: "8px",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: t.inputBg,
    border: `1px solid ${t.borda}`,
    borderRadius: "10px",
    padding: "14px 18px",
    color: t.textoPrincipal,
    fontSize: "15px",
    outline: "none",
    fontFamily: "Plus Jakarta Sans, sans-serif",
    boxSizing: "border-box",
  };

  const cardStyle: React.CSSProperties = {
    background: t.fundoCard,
    border: `1px solid ${t.borda}`,
    borderRadius: "16px",
    padding: "28px",
    marginBottom: "24px",
  };

  const btnPrimario: React.CSSProperties = {
    background: "#F2B705",
    color: "#0B1F3A",
    border: "none",
    borderRadius: "10px",
    padding: "13px 24px",
    fontSize: "12px",
    fontWeight: "800",
    letterSpacing: "2px",
    textTransform: "uppercase",
    cursor: "pointer",
    fontFamily: "Plus Jakarta Sans, sans-serif",
  };

  const btnSecundario: React.CSSProperties = {
    background: "transparent",
    color: t.textoSecundario,
    border: `1px solid ${t.borda}`,
    borderRadius: "8px",
    padding: "8px 14px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "Plus Jakarta Sans, sans-serif",
  };

  const inicial = (perfil?.nome_exibido || perfil?.nome || "?")
    .charAt(0)
    .toUpperCase();

  const sucesso = {
    fundo: tema === "escuro" ? "rgba(74,222,128,0.08)" : "rgba(22,163,74,0.08)",
    borda: tema === "escuro" ? "rgba(74,222,128,0.25)" : "rgba(22,163,74,0.25)",
    texto: tema === "escuro" ? "#4ADE80" : "#16A34A",
  };

  if (carregando) {
    return (
      <AppLayout>
        <div
          style={{
            width: "100%",
            minHeight: "100dvh",
            background: t.fundo,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Anton, sans-serif",
            fontSize: "1.25rem",
            letterSpacing: "3px",
            color: t.destaque,
          }}
        >
          CARREGANDO...
        </div>
      </AppLayout>
    );
  }

  if (erroGlobal) {
    return (
      <AppLayout>
        <div
          style={{
            width: "100%",
            minHeight: "100dvh",
            background: t.fundo,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: t.erroTexto,
            fontFamily: "Plus Jakarta Sans, sans-serif",
          }}
        >
          {erroGlobal}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div
        style={{
          background: t.fundo,
          color: t.textoPrincipal,
          width: "100%",
          minHeight: "100dvh",
        }}
      >
        <div style={{ maxWidth: "720px", margin: "0 auto", padding: "32px 24px", width: "100%" }}>
          <div style={{ marginBottom: "32px" }}>
            <h1
              style={{
                fontFamily: "Anton, sans-serif",
                fontSize: "1.75rem",
                letterSpacing: "2px",
                color: t.textoPrincipal,
                marginBottom: "4px",
              }}
            >
              MEU PERFIL
            </h1>
            <p
              style={{
                color: t.textoSecundario,
                fontSize: "14px",
                fontFamily: "Plus Jakarta Sans, sans-serif",
              }}
            >
              {perfil?.tenant?.nome}
            </p>
          </div>

          <div style={cardStyle}>
            <h2
              style={{
                fontFamily: "Anton, sans-serif",
                fontSize: "1rem",
                letterSpacing: "2px",
                color: t.textoPrincipal,
                marginBottom: "24px",
              }}
            >
              DADOS PESSOAIS
            </h2>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                marginBottom: "28px",
              }}
            >
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  background: "#0B1F3A",
                  border: "3px solid #F2B705",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "Anton, sans-serif",
                  fontSize: "32px",
                  color: "#F2B705",
                  flexShrink: 0,
                }}
              >
                {inicial}
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "Anton, sans-serif",
                    fontSize: "1.2rem",
                    color: t.textoPrincipal,
                    letterSpacing: "1px",
                  }}
                >
                  {perfil?.nome_exibido || perfil?.nome}
                </div>
                <div
                  style={{
                    color: t.textoSecundario,
                    fontSize: "13px",
                    marginTop: "4px",
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                  }}
                >
                  Upload de foto disponível em breve
                </div>
              </div>
            </div>

            <form onSubmit={salvarPerfil}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={labelStyle}>Nome completo</label>
                  <input
                    value={formNome}
                    onChange={(e) => setFormNome(e.target.value)}
                    style={inputStyle}
                    placeholder="Seu nome"
                    onFocus={(e) => (e.target.style.borderColor = "#F2B705")}
                    onBlur={(e) => (e.target.style.borderColor = t.borda)}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Nome de exibição</label>
                  <input
                    value={formNomeExibido}
                    onChange={(e) => setFormNomeExibido(e.target.value)}
                    style={inputStyle}
                    placeholder="Como te chamamos"
                    onFocus={(e) => (e.target.style.borderColor = "#F2B705")}
                    onBlur={(e) => (e.target.style.borderColor = t.borda)}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>E-mail</label>
                <input
                  value={perfil?.email ?? ""}
                  readOnly
                  style={{
                    ...inputStyle,
                    opacity: 0.55,
                    cursor: "not-allowed",
                  }}
                />
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={labelStyle}>Celular</label>
                <input
                  value={formCelular}
                  onChange={(e) => setFormCelular(e.target.value)}
                  style={inputStyle}
                  placeholder="(11) 99999-9999"
                  onFocus={(e) => (e.target.style.borderColor = "#F2B705")}
                  onBlur={(e) => (e.target.style.borderColor = t.borda)}
                />
              </div>

              {erroPerfil && (
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
                  {erroPerfil}
                </div>
              )}

              {sucessoPerfil && (
                <div
                  style={{
                    background: sucesso.fundo,
                    border: `1px solid ${sucesso.borda}`,
                    borderRadius: "8px",
                    padding: "12px 16px",
                    color: sucesso.texto,
                    fontSize: "14px",
                    marginBottom: "16px",
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                  }}
                >
                  Perfil atualizado com sucesso.
                </div>
              )}

              <button
                type="submit"
                disabled={salvandoPerfil}
                style={{ ...btnPrimario, opacity: salvandoPerfil ? 0.6 : 1 }}
              >
                {salvandoPerfil ? "SALVANDO..." : "SALVAR ALTERAÇÕES"}
              </button>
            </form>
          </div>

          <div style={cardStyle}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <h2
                style={{
                  fontFamily: "Anton, sans-serif",
                  fontSize: "1rem",
                  letterSpacing: "2px",
                  color: t.textoPrincipal,
                }}
              >
                MINHAS MOTOS
              </h2>
              <button
                onClick={() => {
                  setErroMoto("");
                  setFormMoto(FORM_MOTO_VAZIO);
                }}
                style={btnPrimario}
              >
                + ADICIONAR
              </button>
            </div>

            {motos.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "32px 0",
                  color: t.textoSecundario,
                  fontSize: "14px",
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                }}
              >
                Nenhuma moto cadastrada ainda.
              </div>
            ) : (
              motos.map((moto) => (
                <div key={moto.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", padding: "16px", border: `1px solid ${t.borda}`, borderRadius: "12px", marginBottom: "10px", background: t.fundo, flexWrap: "wrap" }}>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: "Anton, sans-serif",
                        fontSize: "1rem",
                        color: t.textoPrincipal,
                        letterSpacing: "1px",
                        marginBottom: "4px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {moto.modelo}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "12px",
                        flexWrap: "wrap",
                        fontSize: "12px",
                        color: t.textoSecundario,
                        fontFamily: "Plus Jakarta Sans, sans-serif",
                      }}
                    >
                      {moto.ano && <span>{moto.ano}</span>}
                      {moto.cor && (
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <span
                            style={{
                              width: "10px",
                              height: "10px",
                              borderRadius: "50%",
                              background: moto.cor.toLowerCase(),
                              border: `1px solid ${t.borda}`,
                              display: "inline-block",
                              flexShrink: 0,
                            }}
                          />
                          {moto.cor}
                        </span>
                      )}
                      {moto.categoria && (
                        <span
                          style={{
                            background: "rgba(242,183,5,0.12)",
                            color: "#F2B705",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontSize: "10px",
                            fontWeight: "700",
                            letterSpacing: "1px",
                          }}
                        >
                          {moto.categoria}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                    <button
                      onClick={() => {
                        setErroMoto("");
                        setFormMoto({
                          id: moto.id,
                          modelo: moto.modelo,
                          categoria: moto.categoria ?? "",
                          ano: moto.ano ? String(moto.ano) : "",
                          cor: moto.cor ?? "",
                          identificador: moto.identificador ?? "",
                        });
                      }}
                      style={btnSecundario}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => removerMoto(moto.id)}
                      disabled={removendoId === moto.id}
                      style={{
                        ...btnSecundario,
                        color: t.erroTexto,
                        borderColor: t.erroBorda,
                        opacity: removendoId === moto.id ? 0.5 : 1,
                      }}
                    >
                      {removendoId === moto.id ? "..." : "Remover"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {formMoto !== null && (
        <div
          style={{ position: "fixed", inset: "0", background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500, padding: "16px" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setFormMoto(null);
          }}
        >
          <div style={{ background: t.fundoCard, border: `1px solid ${t.borda}`, borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "460px", maxHeight: "90dvh", overflowY: "auto" }}>
            <h3
              style={{
                fontFamily: "Anton, sans-serif",
                fontSize: "1.1rem",
                letterSpacing: "2px",
                color: t.textoPrincipal,
                marginBottom: "24px",
              }}
            >
              {formMoto.id ? "EDITAR MOTO" : "NOVA MOTO"}
            </h3>

            <form onSubmit={salvarMoto}>
              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>Modelo *</label>
                <input
                  required
                  value={formMoto.modelo}
                  onChange={(e) =>
                    setFormMoto((f) => f && { ...f, modelo: e.target.value })
                  }
                  style={inputStyle}
                  placeholder="Ex: BMW R1250GS"
                  onFocus={(e) => (e.target.style.borderColor = "#F2B705")}
                  onBlur={(e) => (e.target.style.borderColor = t.borda)}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={labelStyle}>Ano</label>
                  <input
                    type="number"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    value={formMoto.ano}
                    onChange={(e) =>
                      setFormMoto((f) => f && { ...f, ano: e.target.value })
                    }
                    style={inputStyle}
                    placeholder="2023"
                    onFocus={(e) => (e.target.style.borderColor = "#F2B705")}
                    onBlur={(e) => (e.target.style.borderColor = t.borda)}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Cor</label>
                  <input
                    value={formMoto.cor}
                    onChange={(e) =>
                      setFormMoto((f) => f && { ...f, cor: e.target.value })
                    }
                    style={inputStyle}
                    placeholder="Ex: Preto"
                    onFocus={(e) => (e.target.style.borderColor = "#F2B705")}
                    onBlur={(e) => (e.target.style.borderColor = t.borda)}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>Categoria</label>
                <input
                  value={formMoto.categoria}
                  onChange={(e) =>
                    setFormMoto((f) => f && { ...f, categoria: e.target.value })
                  }
                  style={inputStyle}
                  placeholder="Ex: ADV, Naked, Custom…"
                  onFocus={(e) => (e.target.style.borderColor = "#F2B705")}
                  onBlur={(e) => (e.target.style.borderColor = t.borda)}
                />
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={labelStyle}>Placa / Identificador</label>
                <input
                  value={formMoto.identificador}
                  onChange={(e) =>
                    setFormMoto(
                      (f) => f && { ...f, identificador: e.target.value },
                    )
                  }
                  style={inputStyle}
                  placeholder="Armazenado de forma segura"
                  onFocus={(e) => (e.target.style.borderColor = "#F2B705")}
                  onBlur={(e) => (e.target.style.borderColor = t.borda)}
                />
              </div>

              {erroMoto && (
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
                  {erroMoto}
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  type="button"
                  onClick={() => setFormMoto(null)}
                  style={btnSecundario}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvandoMoto}
                  style={{ ...btnPrimario, opacity: salvandoMoto ? 0.6 : 1 }}
                >
                  {salvandoMoto ? "SALVANDO..." : "SALVAR"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
