"use client";
import { apiFetch } from "@/lib/api";
import { tempoRelativo } from "@/lib/tempo";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTema } from "@/contexts/TemaContext";
import AppLayout from "@/components/AppLayout";

interface Experiencia {
  id: number;
  tipo: string;
  titulo: string;
  descricao: string | null;
  data: string;
  localizacao: string | null;
  distancia_ou_duracao: string | null;
  participantes: string | null;
  status_validacao: string;
  pontuacao: number | null;
}

const STATUS_CONFIG: Record<string, { cor: string; label: string }> = {
  EM_APROVACAO: { cor: "#D97706", label: "Em aprovação" },
  VALIDADA: { cor: "#16A34A", label: "Validada" },
  VALIDADA_DESTAQUE: { cor: "#16A34A", label: "Destaque" },
  EM_REVISAO: { cor: "#3B82F6", label: "Em revisão" },
  REJEITADA: { cor: "#DC2626", label: "Rejeitada" },
};

const TIPOS = ["VIAGEM", "EVENTO", "ROTA", "MANUTENCAO"];

export default function ExperienciasPage() {
  const router = useRouter();
  const { t } = useTema();
  const [experiencias, setExperiencias] = useState<Experiencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [modal, setModal] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({
    tipo: "VIAGEM",
    titulo: "",
    descricao: "",
    data: "",
    localizacao: "",
    distancia_ou_duracao: "",
    participantes: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    carregar();
  }, []);

  async function carregar() {
    setLoading(true);
    try {
      const res = await apiFetch("/api/v1/experiencias");
      if (res.status === 401) { router.push("/login"); return; }
      const data = await res.json();
      setExperiencias(data);
    } catch {
      setErro("Erro ao carregar experiências");
    } finally {
      setLoading(false);
    }
  }

  async function salvar() {
    if (!form.titulo || !form.data) {
      setErro("Título e data são obrigatórios");
      return;
    }
    setSalvando(true);
    setErro("");
    try {
      const res = await apiFetch("/api/v1/experiencias", {
        method: "POST",
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        setErro(data.error || "Erro ao salvar");
        return;
      }
      setModal(false);
      setForm({ tipo: "VIAGEM", titulo: "", descricao: "", data: "", localizacao: "", distancia_ou_duracao: "", participantes: "" });
      carregar();
    } catch {
      setErro("Erro de conexão");
    } finally {
      setSalvando(false);
    }
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", background: t.fundo, display: "flex", alignItems: "center", justifyContent: "center", color: "#F2B705", fontFamily: "Anton, sans-serif", fontSize: "1.25rem", letterSpacing: "3px" }}>
      CARREGANDO...
    </div>
  );

  return (
    <AppLayout>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .pagina { min-height: 100vh; font-family: Plus Jakarta Sans, sans-serif; }
        .topbar { border-bottom: 1px solid ${t.borda}; padding: 1rem 2rem; display: flex; align-items: center; justify-content: space-between; }
        .conteudo { padding: 2rem; max-width: 900px; margin: 0 auto; }
        .card { border: 1px solid ${t.borda}; border-radius: 16px; padding: 1.5rem; margin-bottom: 1rem; }
        .exp-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; }
        .badge { padding: 3px 10px; border-radius: 99px; font-size: 0.75rem; font-weight: 600; }
        .btn-primary { background: #F2B705; color: #0B1F3A; border: none; border-radius: 10px; padding: 0.75rem 1.5rem; font-size: 0.8125rem; font-weight: 700; letter-spacing: 2px; cursor: pointer; font-family: Plus Jakarta Sans, sans-serif; }
        .btn-secondary { background: transparent; color: ${t.textoSecundario}; border: 1px solid ${t.borda}; border-radius: 10px; padding: 0.75rem 1.5rem; font-size: 0.8125rem; font-weight: 600; cursor: pointer; font-family: Plus Jakarta Sans, sans-serif; }
        .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 1rem; overflow-y: auto; }
        .modal { background: ${t.fundoCard}; border: 1px solid ${t.borda}; border-radius: 16px; padding: 2rem; width: 100%; max-width: 480px; margin: auto; }
        .campo { margin-bottom: 1rem; }
        .label { display: block; font-size: 0.75rem; font-weight: 700; color: ${t.textoSecundario}; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 0.5rem; }
        .input { width: 100%; background: ${t.inputBg}; border: 1px solid ${t.borda}; border-radius: 10px; padding: 0.875rem 1rem; color: ${t.textoPrincipal}; font-size: 1rem; outline: none; font-family: Plus Jakarta Sans, sans-serif; }
        .select { width: 100%; background: ${t.inputBg}; border: 1px solid ${t.borda}; border-radius: 10px; padding: 0.875rem 1rem; color: ${t.textoPrincipal}; font-size: 1rem; outline: none; font-family: Plus Jakarta Sans, sans-serif; cursor: pointer; }
        .textarea { width: 100%; background: ${t.inputBg}; border: 1px solid ${t.borda}; border-radius: 10px; padding: 0.875rem 1rem; color: ${t.textoPrincipal}; font-size: 1rem; outline: none; font-family: Plus Jakarta Sans, sans-serif; resize: vertical; min-height: 80px; }
        @media (max-width: 768px) { .topbar { padding: 1rem; } .conteudo { padding: 1rem; } }
      `}</style>

      <div className="pagina" style={{ background: t.fundo, color: t.textoPrincipal }}>
        
        {/* Conteúdo */}
        <div className="conteudo">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
            <div>
              <h1 style={{ fontFamily: "Anton, sans-serif", fontSize: "1.75rem", letterSpacing: "2px", marginBottom: "4px" }}>
                MINHAS EXPERIÊNCIAS
              </h1>
              <p style={{ color: t.textoSecundario, fontSize: "0.875rem" }}>
                {experiencias.length} experiência{experiencias.length !== 1 ? "s" : ""} registrada{experiencias.length !== 1 ? "s" : ""}
              </p>
            </div>
            <button className="btn-primary" onClick={() => setModal(true)}>
              + REGISTRAR
            </button>
          </div>

          {erro && (
            <div style={{ background: t.erroFundo, border: `1px solid ${t.erroBorda}`, borderRadius: "8px", padding: "12px 16px", color: t.erroTexto, fontSize: "0.875rem", marginBottom: "1rem" }}>
              {erro}
            </div>
          )}

          {experiencias.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem 0", color: t.textoSecundario }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏍️</div>
              <div style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "0.5rem" }}>Nenhuma experiência ainda</div>
              <div style={{ fontSize: "0.875rem" }}>Registre sua primeira viagem, evento ou rota</div>
            </div>
          ) : (
            experiencias.map((exp) => {
              const status = STATUS_CONFIG[exp.status_validacao] || { cor: "#8FA3B8", label: exp.status_validacao };
              return (
                <div key={exp.id} className="card" style={{ background: t.fundoCard }}>
                  <div className="exp-header">
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "4px" }}>{exp.titulo}</div>
                      <div style={{ fontSize: "0.8125rem", color: t.textoSecundario, marginBottom: "8px", fontStyle: "italic" }}>
                        {exp.tipo} · {new Date(exp.data).toLocaleDateString("pt-BR")} · <strong>{tempoRelativo(exp.data)}</strong>
                        {exp.localizacao && ` · ${exp.localizacao}`}
                        {exp.distancia_ou_duracao && ` · ${exp.distancia_ou_duracao}`}
                      </div>
                      {exp.descricao && (
                        <div style={{ fontSize: "0.875rem", color: t.textoSecundario, lineHeight: "1.5" }}>{exp.descricao}</div>
                      )}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px", marginLeft: "1rem" }}>
                      <span className="badge" style={{ background: `${status.cor}20`, color: status.cor, border: `1px solid ${status.cor}40` }}>
                        {status.label}
                      </span>
                      {exp.pontuacao && (
                        <span style={{ fontSize: "0.8125rem", fontWeight: "700", color: "#F2B705" }}>+{exp.pontuacao}pts</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="overlay" onClick={(e) => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <h2 style={{ fontFamily: "Anton, sans-serif", fontSize: "1.375rem", letterSpacing: "2px", marginBottom: "1.5rem", color: t.textoPrincipal }}>
              NOVA EXPERIÊNCIA
            </h2>

            <div className="campo">
              <label className="label">Tipo</label>
              <select className="select" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="campo">
              <label className="label">Título *</label>
              <input className="input" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Ex: Viagem para Campos do Jordão" />
            </div>

            <div className="campo">
              <label className="label">Data *</label>
              <input className="input" type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} />
            </div>

            <div className="campo">
              <label className="label">Localização</label>
              <input className="input" value={form.localizacao} onChange={(e) => setForm({ ...form, localizacao: e.target.value })} placeholder="Ex: Campos do Jordão, SP" />
            </div>

            <div className="campo">
              <label className="label">Distância ou Duração</label>
              <input className="input" value={form.distancia_ou_duracao} onChange={(e) => setForm({ ...form, distancia_ou_duracao: e.target.value })} placeholder="Ex: 320km ou 4h" />
            </div>

            <div className="campo">
              <label className="label">Participantes</label>
              <input className="input" value={form.participantes} onChange={(e) => setForm({ ...form, participantes: e.target.value })} placeholder="Ex: Carlos, Rogério, Ana" />
            </div>

            <div className="campo">
              <label className="label">Descrição</label>
              <textarea className="textarea" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Conte como foi..." />
            </div>

            {erro && (
              <div style={{ background: t.erroFundo, border: `1px solid ${t.erroBorda}`, borderRadius: "8px", padding: "12px", color: t.erroTexto, fontSize: "0.875rem", marginBottom: "1rem" }}>
                {erro}
              </div>
            )}

            <div style={{ display: "flex", gap: "12px", marginTop: "0.5rem" }}>
              <button className="btn-secondary" onClick={() => setModal(false)} style={{ flex: 1 }}>
                CANCELAR
              </button>
              <button className="btn-primary" onClick={salvar} disabled={salvando} style={{ flex: 1 }}>
                {salvando ? "SALVANDO..." : "SALVAR"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
