import { prisma } from "../../../utils/prisma";

// Tabela de niveis
const NIVEIS = [
  { nivel: 1, nome: "Iniciante", pontos_min: 0, pontos_max: 49 },
  { nivel: 2, nome: "Basico", pontos_min: 50, pontos_max: 149 },
  { nivel: 3, nome: "Intermediario", pontos_min: 150, pontos_max: 349 },
  { nivel: 4, nome: "Avancado", pontos_min: 350, pontos_max: 699 },
  { nivel: 5, nome: "Consistente", pontos_min: 700, pontos_max: 99999 },
];

function calcularNivel(pontos: number) {
  return (
    NIVEIS.find((n) => pontos >= n.pontos_min && pontos <= n.pontos_max) ||
    NIVEIS[0]
  );
}

// =============================================
// BUSCAR EVOLUCAO DO USUARIO
// =============================================

export async function buscarEvolucao(usuario_id: number, tenant_id: number) {
  const usuarioTenant = await prisma.usuarioTenant.findFirst({
    where: { usuario_id, tenant_id, status: "ATIVO" },
  });

  if (!usuarioTenant) throw new Error("Usuario nao encontrado neste tenant");

  // Busca todas as experiencias validadas
  const experiencias = await prisma.experiencia.findMany({
    where: {
      usuario_id,
      tenant_id,
      status_validacao: { in: ["VALIDADA", "VALIDADA_DESTAQUE"] },
      deleted_at: null,
    },
    orderBy: { created_at: "desc" },
  });

  // Calcula pontuacao total
  const pontuacaoTotal = experiencias.reduce(
    (acc: number, exp: any) => acc + (exp.pontuacao || 0),
    0,
  );

  // Busca historico de evolucao
  const historico = await prisma.evolucao.findMany({
    where: { usuario_id, tenant_id },
    orderBy: { created_at: "desc" },
    take: 10,
  });

  const nivelAtual = calcularNivel(pontuacaoTotal);
  const proximoNivel = NIVEIS.find((n) => n.nivel === nivelAtual.nivel + 1);

  const progresso = proximoNivel
    ? Math.floor(
        ((pontuacaoTotal - nivelAtual.pontos_min) /
          (proximoNivel.pontos_min - nivelAtual.pontos_min)) *
          100,
      )
    : 100;

  return {
    nivel_atual: nivelAtual.nivel,
    nome_nivel: nivelAtual.nome,
    pontuacao_total: pontuacaoTotal,
    progresso_percentual: progresso,
    pontos_para_proximo: proximoNivel
      ? proximoNivel.pontos_min - pontuacaoTotal
      : 0,
    proximo_nivel: proximoNivel?.nome || "Nivel maximo atingido",
    total_experiencias: experiencias.length,
    historico,
  };
}

// =============================================
// ADICIONAR PONTUACAO
// =============================================

export async function adicionarPontuacao(
  usuario_id: number,
  tenant_id: number,
  pontos: number,
  motivo: string,
) {
  const usuarioTenant = await prisma.usuarioTenant.findFirst({
    where: { usuario_id, tenant_id, status: "ATIVO" },
  });

  if (!usuarioTenant) throw new Error("Usuario nao encontrado neste tenant");

  // Busca pontuacao atual
  const experiencias = await prisma.experiencia.findMany({
    where: {
      usuario_id,
      tenant_id,
      status_validacao: { in: ["VALIDADA", "VALIDADA_DESTAQUE"] },
      deleted_at: null,
    },
  });

  const pontuacaoAtual = experiencias.reduce(
    (acc: number, exp: any) => acc + (exp.pontuacao || 0),
    0,
  );
  const novaPontuacao = pontuacaoAtual + pontos;

  const nivelAnterior = calcularNivel(pontuacaoAtual);
  const novoNivel = calcularNivel(novaPontuacao);

  // Atualiza nivel se mudou
  if (novoNivel.nivel !== nivelAnterior.nivel) {
    await prisma.usuarioTenant.update({
      where: { id: usuarioTenant.id },
      data: { nivel_atual: novoNivel.nivel },
    });

    await prisma.evolucao.create({
      data: {
        usuario_id,
        tenant_id,
        nivel_anterior: nivelAnterior.nivel,
        nivel_atual: novoNivel.nivel,
        motivo,
      },
    });
  }

  return {
    pontuacao_anterior: pontuacaoAtual,
    pontuacao_nova: novaPontuacao,
    nivel_anterior: nivelAnterior.nivel,
    nivel_atual: novoNivel.nivel,
    subiu_nivel: novoNivel.nivel > nivelAnterior.nivel,
  };
}

// =============================================
// BUSCAR DASHBOARD
// =============================================

export async function buscarDashboard(usuario_id: number, tenant_id: number) {
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuario_id },
    select: { nome: true, nome_exibido: true, foto_url: true },
  });

  const evolucao = await buscarEvolucao(usuario_id, tenant_id);

  // Ultimas experiencias
  const ultimasExperiencias = await prisma.experiencia.findMany({
    where: { usuario_id, tenant_id, deleted_at: null },
    orderBy: { created_at: "desc" },
    take: 5,
  });

  // Stats gerais
  const totalExperiencias = await prisma.experiencia.count({
    where: { usuario_id, tenant_id, deleted_at: null },
  });

  const pendentes = await prisma.experiencia.count({
    where: {
      usuario_id,
      tenant_id,
      status_validacao: { in: ["EM_APROVACAO", "EM_REVISAO"] },
      deleted_at: null,
    },
  });

  const equipamentos = await prisma.equipamento.count({
    where: { usuario_id, tenant_id, ativo: true, deleted_at: null },
  });

  return {
    usuario: {
      nome: usuario?.nome_exibido || usuario?.nome,
      foto_url: usuario?.foto_url,
    },
    nivel: {
      atual: evolucao.nivel_atual,
      nome: evolucao.nome_nivel,
      progresso: evolucao.progresso_percentual,
      pontuacao: evolucao.pontuacao_total,
      pontos_para_proximo: evolucao.pontos_para_proximo,
      proximo: evolucao.proximo_nivel,
    },
    stats: {
      total_experiencias: totalExperiencias,
      pendentes_validacao: pendentes,
      equipamentos,
      experiencias_validadas: evolucao.total_experiencias,
    },
    ultimas_experiencias: ultimasExperiencias.map((exp: any) => ({
      id: exp.id,
      tipo: exp.tipo,
      titulo: exp.titulo,
      data: exp.data,
      status_validacao: exp.status_validacao,
      pontuacao: exp.pontuacao,
    })),
  };
}
