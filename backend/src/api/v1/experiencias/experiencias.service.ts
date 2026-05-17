import { prisma } from "../../../utils/prisma";
import { getChaveAtiva, getChavePorId, decrypt } from "../../../utils/crypto";

// =============================================
// LISTAR EXPERIENCIAS
// =============================================

export async function listarExperiencias(
  usuario_id: number,
  tenant_id: number,
  filtros?: {
    tipo?: string;
    status_validacao?: string;
  },
) {
  const where: any = {
    usuario_id,
    tenant_id,
    deleted_at: null,
  };

  if (filtros?.tipo) where.tipo = filtros.tipo;
  if (filtros?.status_validacao)
    where.status_validacao = filtros.status_validacao;

  const experiencias = await prisma.experiencia.findMany({
    where,
    include: {
      evidencias: { where: { deleted_at: null } },
      validacoes: { orderBy: { created_at: "desc" }, take: 1 },
    },
    orderBy: { data: "desc" },
  });

  const resultado = await Promise.all(
    experiencias.map(async (exp: any) => {
      let localizacao = exp.localizacao;
      if (exp.localizacao && exp.chave_cripto_id) {
        const chave = await getChavePorId(prisma as any, exp.chave_cripto_id);
        localizacao = decrypt(exp.localizacao, chave);
      }
      return {
        id: exp.id,
        tipo: exp.tipo,
        titulo: exp.titulo,
        descricao: exp.descricao,
        data: exp.data,
        localizacao,
        distancia_ou_duracao: exp.distancia_ou_duracao,
        participantes: exp.participantes,
        status_validacao: exp.status_validacao,
        pontuacao: exp.pontuacao,
        evidencias: exp.evidencias.length,
        ultima_validacao: exp.validacoes[0] || null,
        created_at: exp.created_at,
      };
    }),
  );

  return resultado;
}

// =============================================
// BUSCAR EXPERIENCIA POR ID
// =============================================

export async function buscarExperiencia(
  id: number,
  usuario_id: number,
  tenant_id: number,
) {
  const exp = await prisma.experiencia.findFirst({
    where: { id, usuario_id, tenant_id, deleted_at: null },
    include: {
      evidencias: { where: { deleted_at: null } },
      validacoes: { orderBy: { created_at: "desc" } },
    },
  });

  if (!exp) throw new Error("Experiencia nao encontrada");

  let localizacao = exp.localizacao;
  if (exp.localizacao && exp.chave_cripto_id) {
    const chave = await getChavePorId(prisma as any, exp.chave_cripto_id);
    localizacao = decrypt(exp.localizacao, chave);
  }

  return {
    id: exp.id,
    tipo: exp.tipo,
    titulo: exp.titulo,
    descricao: exp.descricao,
    data: exp.data,
    localizacao,
    distancia_ou_duracao: exp.distancia_ou_duracao,
    participantes: exp.participantes,
    status_validacao: exp.status_validacao,
    pontuacao: exp.pontuacao,
    evidencias: exp.evidencias,
    historico_validacao: exp.validacoes,
    created_at: exp.created_at,
  };
}

// =============================================
// CRIAR EXPERIENCIA
// =============================================

export async function criarExperiencia(
  usuario_id: number,
  tenant_id: number,
  dados: {
    tipo: string;
    titulo: string;
    descricao?: string;
    data: Date;
    localizacao?: string;
    distancia_ou_duracao?: string;
    participantes?: number;
  },
) {
  const chave = await getChaveAtiva(prisma as any);

  const localizacaoEnc = dados.localizacao
    ? require("../../../utils/crypto").encrypt(dados.localizacao, chave.key)
    : null;

  const experiencia = await prisma.experiencia.create({
    data: {
      usuario_id,
      tenant_id,
      tipo: dados.tipo as any,
      titulo: dados.titulo,
      descricao: dados.descricao,
      data: dados.data,
      localizacao: localizacaoEnc,
      distancia_ou_duracao: dados.distancia_ou_duracao,
      participantes: dados.participantes,
      status_validacao: "EM_APROVACAO",
      chave_cripto_id: localizacaoEnc ? chave.id : null,
    },
  });

  // Log de auditoria
  await prisma.auditoriaLog.create({
    data: {
      tenant_id,
      usuario_id,
      tipo_log: "ACAO",
      tabela: "experiencias",
      registro_id: experiencia.id,
      acao: "CREATE_EXPERIENCIA",
      valor_novo: { tipo: dados.tipo, titulo: dados.titulo },
    },
  });

  return {
    id: experiencia.id,
    titulo: experiencia.titulo,
    status_validacao: experiencia.status_validacao,
    message: "Experiencia registrada e enviada para validacao",
  };
}

// =============================================
// ATUALIZAR EXPERIENCIA (somente EM_REVISAO)
// =============================================

export async function atualizarExperiencia(
  id: number,
  usuario_id: number,
  tenant_id: number,
  dados: {
    titulo?: string;
    descricao?: string;
    localizacao?: string;
    distancia_ou_duracao?: string;
    participantes?: number;
  },
) {
  const exp = await prisma.experiencia.findFirst({
    where: { id, usuario_id, tenant_id, deleted_at: null },
  });

  if (!exp) throw new Error("Experiencia nao encontrada");

  if (exp.status_validacao !== "EM_REVISAO") {
    throw new Error("Somente experiencias em revisao podem ser editadas");
  }

  const chave = await getChaveAtiva(prisma as any);
  const dadosUpdate: any = {};

  if (dados.titulo) dadosUpdate.titulo = dados.titulo;
  if (dados.descricao) dadosUpdate.descricao = dados.descricao;
  if (dados.distancia_ou_duracao)
    dadosUpdate.distancia_ou_duracao = dados.distancia_ou_duracao;
  if (dados.participantes) dadosUpdate.participantes = dados.participantes;
  if (dados.localizacao) {
    dadosUpdate.localizacao = require("../../../utils/crypto").encrypt(
      dados.localizacao,
      chave.key,
    );
    dadosUpdate.chave_cripto_id = chave.id;
  }

  // Volta para EM_APROVACAO apos edicao
  dadosUpdate.status_validacao = "EM_APROVACAO";

  await prisma.experiencia.update({ where: { id }, data: dadosUpdate });

  await prisma.auditoriaLog.create({
    data: {
      tenant_id,
      usuario_id,
      tipo_log: "ACAO",
      tabela: "experiencias",
      registro_id: id,
      acao: "UPDATE_EXPERIENCIA",
      valor_novo: dados,
    },
  });

  return { message: "Experiencia atualizada e reenviada para validacao" };
}

// =============================================
// SOFT DELETE
// =============================================

export async function deletarExperiencia(
  id: number,
  usuario_id: number,
  tenant_id: number,
) {
  const exp = await prisma.experiencia.findFirst({
    where: { id, usuario_id, tenant_id, deleted_at: null },
  });

  if (!exp) throw new Error("Experiencia nao encontrada");

  if (!["EM_APROVACAO", "EM_REVISAO"].includes(exp.status_validacao)) {
    throw new Error("Somente experiencias pendentes podem ser removidas");
  }

  await prisma.experiencia.update({
    where: { id },
    data: { deleted_at: new Date() },
  });

  await prisma.auditoriaLog.create({
    data: {
      tenant_id,
      usuario_id,
      tipo_log: "ACAO",
      tabela: "experiencias",
      registro_id: id,
      acao: "DELETE_EXPERIENCIA",
    },
  });

  return { message: "Experiencia removida com sucesso" };
}
