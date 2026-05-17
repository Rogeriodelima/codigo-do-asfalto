import { prisma } from "../../../utils/prisma";
import {
  notificarValidadorWhatsApp,
  notificarUsuarioValidacaoWhatsApp,
} from "../../../utils/whatsapp";

// =============================================
// CALCULAR PONTUACAO
// =============================================

function calcularPontuacao(acao: string): number {
  if (acao === "APROVADA_DESTAQUE") return 15;
  if (acao === "APROVADA") return 10;
  return 0;
}

// =============================================
// MAPEAR ACAO PARA STATUS
// =============================================

function mapearStatus(
  acao: string,
): "VALIDADA" | "VALIDADA_DESTAQUE" | "EM_REVISAO" | "REJEITADA" {
  const statusMap: Record<
    string,
    "VALIDADA" | "VALIDADA_DESTAQUE" | "EM_REVISAO" | "REJEITADA"
  > = {
    APROVADA: "VALIDADA",
    APROVADA_DESTAQUE: "VALIDADA_DESTAQUE",
    EM_REVISAO: "EM_REVISAO",
    REJEITADA: "REJEITADA",
  };
  const status = statusMap[acao];
  if (!status) throw new Error(`Acao invalida: ${acao}`);
  return status;
}

// =============================================
// NOTIFICAR VALIDADORES
// =============================================

export async function notificarValidadores(
  experiencia_id: number,
  tenant_id: number,
) {
  const validadores = await prisma.validadorTenant.findMany({
    where: { tenant_id, ativo: true },
    orderBy: { ordem: "asc" },
    include: { usuario: true },
  });

  if (validadores.length === 0) return;

  const experiencia = await prisma.experiencia.findUnique({
    where: { id: experiencia_id },
    include: { usuario: true, tenant: true },
  });

  if (!experiencia) return;

  const primeiroValidador = validadores[0];

  console.log(
    `Notificando validador ${primeiroValidador.usuario.email} por email`,
  );

  if (primeiroValidador.usuario.celular) {
    await notificarValidadorWhatsApp({
      telefone: primeiroValidador.usuario.celular,
      nome_validador: primeiroValidador.usuario.nome,
      nome_usuario: experiencia.usuario.nome,
      titulo_experiencia: experiencia.titulo,
      tipo_experiencia: experiencia.tipo,
      tenant_nome: experiencia.tenant.nome,
      experiencia_id: experiencia.id,
    });
  }
}

// =============================================
// VALIDAR EXPERIENCIA
// =============================================

export async function validarExperiencia(
  experiencia_id: number,
  validador_id: number,
  tenant_id: number,
  dados: {
    acao: string;
    observacao?: string;
  },
) {
  const experiencia = await prisma.experiencia.findFirst({
    where: { id: experiencia_id, tenant_id, deleted_at: null },
    include: { usuario: true, tenant: true },
  });

  if (!experiencia) {
    throw new Error("Experiencia nao encontrada");
  }

  if (!["EM_APROVACAO", "EM_REVISAO"].includes(experiencia.status_validacao)) {
    throw new Error("Experiencia nao pode ser validada neste status");
  }

  const novoStatus = mapearStatus(dados.acao);
  const pontuacao = calcularPontuacao(dados.acao);

  // Atualiza experiencia com status correto
  await prisma.experiencia.update({
    where: { id: experiencia_id },
    data: {
      status_validacao: novoStatus,
      pontuacao: pontuacao > 0 ? pontuacao : undefined,
    },
  });

  // Registra validacao
  await prisma.validacao.create({
    data: {
      experiencia_id,
      tenant_id,
      validador_id,
      acao: dados.acao as
        | "APROVADA"
        | "APROVADA_DESTAQUE"
        | "EM_REVISAO"
        | "REJEITADA",
      observacao: dados.observacao,
    },
  });

  // Atualiza score se aprovada
  if (pontuacao > 0) {
    await atualizarScore(experiencia.usuario_id, tenant_id, pontuacao);
  }

  // Log de auditoria
  await prisma.auditoriaLog.create({
    data: {
      tenant_id,
      usuario_id: validador_id,
      tipo_log: "ACAO",
      tabela: "experiencias",
      registro_id: experiencia_id,
      acao: `VALIDACAO_${dados.acao}`,
      valor_novo: { acao: dados.acao, observacao: dados.observacao, pontuacao },
    },
  });

  // Notifica usuario por WhatsApp
  if (experiencia.usuario.celular) {
    await notificarUsuarioValidacaoWhatsApp({
      telefone: experiencia.usuario.celular,
      nome_usuario: experiencia.usuario.nome,
      titulo_experiencia: experiencia.titulo,
      status: dados.acao,
      observacao: dados.observacao,
      tenant_nome: experiencia.tenant.nome,
    });
  }

  return {
    message: "Experiencia validada com sucesso",
    status: novoStatus,
    pontuacao,
  };
}

// =============================================
// ATUALIZAR SCORE DO USUARIO
// =============================================

async function atualizarScore(
  usuario_id: number,
  tenant_id: number,
  pontos: number,
) {
  const usuarioTenant = await prisma.usuarioTenant.findFirst({
    where: { usuario_id, tenant_id, status: "ATIVO" },
  });

  if (!usuarioTenant) return;

  // TODO: implementar logica completa de pontuacao acumulada
  await prisma.auditoriaLog.create({
    data: {
      tenant_id,
      usuario_id,
      tipo_log: "ACAO",
      tabela: "usuario_tenants",
      registro_id: usuarioTenant.id,
      acao: "PONTUACAO_ADICIONADA",
      valor_novo: { pontos_adicionados: pontos },
    },
  });
}

// =============================================
// LISTAR FILA DE VALIDACAO
// =============================================

export async function listarFilaValidacao(tenant_id: number) {
  const experiencias = await prisma.experiencia.findMany({
    where: {
      tenant_id,
      status_validacao: { in: ["EM_APROVACAO", "EM_REVISAO"] },
      deleted_at: null,
    },
    include: {
      usuario: { select: { id: true, nome: true, email: true } },
      evidencias: { where: { deleted_at: null } },
      validacoes: { orderBy: { created_at: "desc" }, take: 1 },
    },
    orderBy: { created_at: "asc" },
  });

  return experiencias.map((exp: any) => ({
    id: exp.id,
    tipo: exp.tipo,
    titulo: exp.titulo,
    data: exp.data,
    status_validacao: exp.status_validacao,
    usuario: exp.usuario,
    evidencias: exp.evidencias.length,
    ultima_validacao: exp.validacoes[0] || null,
    created_at: exp.created_at,
    tempo_espera_horas: Math.floor(
      (Date.now() - new Date(exp.created_at).getTime()) / 3600000,
    ),
  }));
}
