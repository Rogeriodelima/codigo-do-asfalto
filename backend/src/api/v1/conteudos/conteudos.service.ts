import { prisma } from "../../../utils/prisma";

// =============================================
// LISTAR CONTEUDOS
// =============================================

export async function listarConteudos(
  tenant_id: number,
  nivel_usuario: number,
  filtros?: {
    tipo?: string;
    busca?: string;
  },
) {
  const where: any = {
    tenant_id,
    ativo: true,
    deleted_at: null,
    OR: [
      { nivel_recomendado: null },
      { nivel_recomendado: { lte: nivel_usuario } },
    ],
  };

  if (filtros?.tipo) where.tipo = filtros.tipo;
  if (filtros?.busca) {
    where.AND = {
      OR: [
        { titulo: { contains: filtros.busca, mode: "insensitive" } },
        { descricao: { contains: filtros.busca, mode: "insensitive" } },
      ],
    };
  }

  const conteudos = await prisma.conteudo.findMany({
    where,
    orderBy: [{ nivel_recomendado: "asc" }, { created_at: "desc" }],
  });

  return conteudos.map((c: any) => ({
    id: c.id,
    titulo: c.titulo,
    descricao: c.descricao,
    tipo: c.tipo,
    nivel_recomendado: c.nivel_recomendado,
    tempo_leitura_min: c.tempo_leitura_min,
    thumbnail_url: c.thumbnail_url,
  }));
}

// =============================================
// BUSCAR CONTEUDO POR ID
// =============================================

export async function buscarConteudo(id: number, tenant_id: number) {
  const conteudo = await prisma.conteudo.findFirst({
    where: { id, tenant_id, ativo: true, deleted_at: null },
  });

  if (!conteudo) throw new Error("Conteudo nao encontrado");

  return conteudo;
}

// =============================================
// RECOMENDACOES POR NIVEL
// =============================================

export async function buscarRecomendacoes(
  tenant_id: number,
  nivel_usuario: number,
) {
  const conteudos = await prisma.conteudo.findMany({
    where: {
      tenant_id,
      ativo: true,
      deleted_at: null,
      nivel_recomendado: nivel_usuario,
    },
    orderBy: { created_at: "desc" },
    take: 5,
  });

  return conteudos.map((c: any) => ({
    id: c.id,
    titulo: c.titulo,
    descricao: c.descricao,
    tipo: c.tipo,
    tempo_leitura_min: c.tempo_leitura_min,
    thumbnail_url: c.thumbnail_url,
  }));
}

// =============================================
// CRIAR CONTEUDO (admin)
// =============================================

export async function criarConteudo(
  tenant_id: number,
  dados: {
    titulo: string;
    descricao?: string;
    corpo?: string;
    tipo: string;
    nivel_recomendado?: number;
    tempo_leitura_min?: number;
    thumbnail_url?: string;
  },
) {
  const conteudo = await prisma.conteudo.create({
    data: {
      tenant_id,
      titulo: dados.titulo,
      descricao: dados.descricao,
      corpo: dados.corpo,
      tipo: dados.tipo as any,
      nivel_recomendado: dados.nivel_recomendado,
      tempo_leitura_min: dados.tempo_leitura_min,
      thumbnail_url: dados.thumbnail_url,
    },
  });

  return {
    id: conteudo.id,
    titulo: conteudo.titulo,
    message: "Conteudo criado com sucesso",
  };
}

// =============================================
// ATUALIZAR CONTEUDO (admin)
// =============================================

export async function atualizarConteudo(
  id: number,
  tenant_id: number,
  dados: {
    titulo?: string;
    descricao?: string;
    corpo?: string;
    tipo?: string;
    nivel_recomendado?: number;
    tempo_leitura_min?: number;
    thumbnail_url?: string;
    ativo?: boolean;
  },
) {
  const conteudo = await prisma.conteudo.findFirst({
    where: { id, tenant_id, deleted_at: null },
  });

  if (!conteudo) throw new Error("Conteudo nao encontrado");

  await prisma.conteudo.update({
    where: { id },
    data: {
      ...dados,
      tipo: dados.tipo as any,
    },
  });

  return { message: "Conteudo atualizado com sucesso" };
}
