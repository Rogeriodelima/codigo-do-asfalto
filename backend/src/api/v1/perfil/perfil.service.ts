import { prisma } from "../../../utils/prisma";
import {
  getChavePorId,
  decrypt,
  getChaveAtiva,
  encrypt,
} from "../../../utils/crypto";
import { uploadArquivo, deletarArquivo } from "../../../utils/storage";

// =============================================
// BUSCAR PERFIL
// =============================================

export async function buscarPerfil(usuario_id: number, tenant_id: number) {
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuario_id },
    include: {
      tenants: {
        where: { tenant_id, status: "ATIVO" },
        include: { tenant: true },
      },
    },
  });

  if (!usuario) {
    throw new Error("Usuario nao encontrado");
  }

  const usuarioTenant = usuario.tenants[0];
  if (!usuarioTenant) {
    throw new Error("Usuario nao tem acesso a este tenant");
  }

  // Descriptografa dados sensiveis
  let celular = null;
  if (usuario.celular && usuario.chave_cripto_id) {
    const chave = await getChavePorId(prisma as any, usuario.chave_cripto_id);
    celular = decrypt(usuario.celular, chave);
  }

  return {
    id: usuario.id,
    nome: usuario.nome,
    nome_exibido: usuario.nome_exibido,
    email: usuario.email,
    celular,
    foto_url: usuario.foto_url,
    email_verificado: usuario.email_verificado,
    nivel_atual: usuarioTenant.nivel_atual,
    tenant: {
      id: usuarioTenant.tenant.id,
      nome: usuarioTenant.tenant.nome,
      slug: usuarioTenant.tenant.slug,
      cor_primaria: usuarioTenant.tenant.cor_primaria,
      cor_secundaria: usuarioTenant.tenant.cor_secundaria,
    },
    created_at: usuario.created_at,
  };
}

// =============================================
// ATUALIZAR PERFIL
// =============================================

export async function atualizarPerfil(
  usuario_id: number,
  tenant_id: number,
  dados: {
    nome?: string;
    nome_exibido?: string;
    celular?: string;
  },
) {
  const chave = await getChaveAtiva(prisma as any);

  const dadosUpdate: any = {};

  if (dados.nome) dadosUpdate.nome = dados.nome;
  if (dados.nome_exibido) dadosUpdate.nome_exibido = dados.nome_exibido;
  if (dados.celular) {
    dadosUpdate.celular = encrypt(dados.celular, chave.key);
    dadosUpdate.chave_cripto_id = chave.id;
  }

  const usuario = await prisma.usuario.update({
    where: { id: usuario_id },
    data: dadosUpdate,
  });

  // Log de auditoria
  await prisma.auditoriaLog.create({
    data: {
      tenant_id,
      usuario_id,
      tipo_log: "ACAO",
      tabela: "usuarios",
      registro_id: usuario_id,
      acao: "UPDATE_PERFIL",
      valor_novo: dados,
    },
  });

  return { message: "Perfil atualizado com sucesso" };
}

// =============================================
// ATUALIZAR FOTO DE PERFIL
// =============================================

export async function atualizarFotoPerfil(
  usuario_id: number,
  tenant_id: number,
  buffer: Buffer,
  contentType: string,
  extensao: string,
): Promise<string> {
  const nomeArquivo = `fotos-perfil/${usuario_id}-${Date.now()}.${extensao}`;

  // Remove foto anterior do R2 se existir e for do mesmo bucket
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuario_id },
    select: { foto_url: true },
  });

  const publicUrl = process.env.R2_PUBLIC_URL ?? "";
  if (usuario?.foto_url && publicUrl && usuario.foto_url.startsWith(publicUrl)) {
    const chaveAntiga = usuario.foto_url.replace(`${publicUrl}/`, "");
    await deletarArquivo(chaveAntiga).catch(() => {});
  }

  const url = await uploadArquivo(buffer, nomeArquivo, contentType);

  await prisma.usuario.update({
    where: { id: usuario_id },
    data: { foto_url: url },
  });

  await prisma.auditoriaLog.create({
    data: {
      tenant_id,
      usuario_id,
      tipo_log: "ACAO",
      tabela: "usuarios",
      registro_id: usuario_id,
      acao: "UPDATE_FOTO_PERFIL",
      valor_novo: { foto_url: url },
    },
  });

  return url;
}
