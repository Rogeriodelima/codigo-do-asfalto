import { prisma } from "../../../utils/prisma";
import {
  getChaveAtiva,
  encrypt,
  getChavePorId,
  decrypt,
} from "../../../utils/crypto";

// =============================================
// LISTAR EQUIPAMENTOS
// =============================================

export async function listarEquipamentos(
  usuario_id: number,
  tenant_id: number,
) {
  const equipamentos = await prisma.equipamento.findMany({
    where: {
      usuario_id,
      tenant_id,
      ativo: true,
      deleted_at: null,
    },
    orderBy: { created_at: "desc" },
  });

  // Descriptografa identificador de cada equipamento
  const resultado = await Promise.all(
    equipamentos.map(async (eq) => {
      let identificador = null;
      if (eq.identificador && eq.chave_cripto_id) {
        const chave = await getChavePorId(prisma as any, eq.chave_cripto_id);
        identificador = decrypt(eq.identificador, chave);
      }
      return {
        id: eq.id,
        tipo_produto: eq.tipo_produto,
        modelo: eq.modelo,
        categoria: eq.categoria,
        ano: eq.ano,
        cor: eq.cor,
        identificador,
        foto_url: eq.foto_url,
        ativo: eq.ativo,
        created_at: eq.created_at,
      };
    }),
  );

  return resultado;
}

// =============================================
// BUSCAR EQUIPAMENTO POR ID
// =============================================

export async function buscarEquipamento(
  id: number,
  usuario_id: number,
  tenant_id: number,
) {
  const eq = await prisma.equipamento.findFirst({
    where: { id, usuario_id, tenant_id, deleted_at: null },
  });

  if (!eq) {
    throw new Error("Equipamento nao encontrado");
  }

  let identificador = null;
  if (eq.identificador && eq.chave_cripto_id) {
    const chave = await getChavePorId(prisma as any, eq.chave_cripto_id);
    identificador = decrypt(eq.identificador, chave);
  }

  return {
    id: eq.id,
    tipo_produto: eq.tipo_produto,
    modelo: eq.modelo,
    categoria: eq.categoria,
    ano: eq.ano,
    cor: eq.cor,
    identificador,
    foto_url: eq.foto_url,
    ativo: eq.ativo,
    created_at: eq.created_at,
  };
}

// =============================================
// CRIAR EQUIPAMENTO
// =============================================

export async function criarEquipamento(
  usuario_id: number,
  tenant_id: number,
  dados: {
    tipo_produto?: string;
    modelo: string;
    categoria?: string;
    ano?: number;
    cor?: string;
    identificador?: string;
  },
) {
  const chave = await getChaveAtiva(prisma as any);

  const identificadorEnc = dados.identificador
    ? encrypt(dados.identificador, chave.key)
    : null;

  const equipamento = await prisma.equipamento.create({
    data: {
      usuario_id,
      tenant_id,
      tipo_produto: (dados.tipo_produto as any) || "MOTO",
      modelo: dados.modelo,
      categoria: dados.categoria,
      ano: dados.ano,
      cor: dados.cor,
      identificador: identificadorEnc,
      chave_cripto_id: identificadorEnc ? chave.id : null,
    },
  });

  // Log de auditoria
  await prisma.auditoriaLog.create({
    data: {
      tenant_id,
      usuario_id,
      tipo_log: "ACAO",
      tabela: "equipamentos",
      registro_id: equipamento.id,
      acao: "CREATE_EQUIPAMENTO",
      valor_novo: { modelo: dados.modelo, tipo_produto: dados.tipo_produto },
    },
  });

  return {
    id: equipamento.id,
    modelo: equipamento.modelo,
    message: "Equipamento criado com sucesso",
  };
}

// =============================================
// ATUALIZAR EQUIPAMENTO
// =============================================

export async function atualizarEquipamento(
  id: number,
  usuario_id: number,
  tenant_id: number,
  dados: {
    modelo?: string;
    categoria?: string;
    ano?: number;
    cor?: string;
    identificador?: string;
  },
) {
  const eq = await prisma.equipamento.findFirst({
    where: { id, usuario_id, tenant_id, deleted_at: null },
  });

  if (!eq) {
    throw new Error("Equipamento nao encontrado");
  }

  const chave = await getChaveAtiva(prisma as any);
  const dadosUpdate: any = {};

  if (dados.modelo) dadosUpdate.modelo = dados.modelo;
  if (dados.categoria) dadosUpdate.categoria = dados.categoria;
  if (dados.ano) dadosUpdate.ano = dados.ano;
  if (dados.cor) dadosUpdate.cor = dados.cor;
  if (dados.identificador) {
    dadosUpdate.identificador = encrypt(dados.identificador, chave.key);
    dadosUpdate.chave_cripto_id = chave.id;
  }

  await prisma.equipamento.update({
    where: { id },
    data: dadosUpdate,
  });

  await prisma.auditoriaLog.create({
    data: {
      tenant_id,
      usuario_id,
      tipo_log: "ACAO",
      tabela: "equipamentos",
      registro_id: id,
      acao: "UPDATE_EQUIPAMENTO",
      valor_novo: dados,
    },
  });

  return { message: "Equipamento atualizado com sucesso" };
}

// =============================================
// DESATIVAR EQUIPAMENTO (soft delete)
// =============================================

export async function desativarEquipamento(
  id: number,
  usuario_id: number,
  tenant_id: number,
) {
  const eq = await prisma.equipamento.findFirst({
    where: { id, usuario_id, tenant_id, deleted_at: null },
  });

  if (!eq) {
    throw new Error("Equipamento nao encontrado");
  }

  await prisma.equipamento.update({
    where: { id },
    data: {
      ativo: false,
      deleted_at: new Date(),
    },
  });

  await prisma.auditoriaLog.create({
    data: {
      tenant_id,
      usuario_id,
      tipo_log: "ACAO",
      tabela: "equipamentos",
      registro_id: id,
      acao: "DELETE_EQUIPAMENTO",
    },
  });

  return { message: "Equipamento desativado com sucesso" };
}
