import jwt from "jsonwebtoken";
import { prisma } from "../../../utils/prisma";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// =============================================
// BUSCAR TENANTS DO USUÁRIO AUTENTICADO
// =============================================

export async function buscarTenantsPorUsuario(usuario_id: number) {
  const registros = await prisma.usuarioTenant.findMany({
    where: {
      usuario_id,
      status: "ATIVO",
      deleted_at: null,
    },
    include: {
      tenant: {
        select: {
          id: true,
          nome: true,
          logo_url: true,
        },
      },
    },
    orderBy: [{ tenant_padrao: "desc" }, { created_at: "asc" }],
  });

  return registros.map((ut: (typeof registros)[number]) => ({
    id: ut.tenant.id,
    nome: ut.tenant.nome,
    logo_url: ut.tenant.logo_url,
  }));
}

// =============================================
// BUSCAR PERFIL DO USUÁRIO NO TENANT ATUAL
// =============================================

export async function buscarPerfilDoUsuario(
  usuario_id: number,
  tenant_id: number,
) {
  const ut = await prisma.usuarioTenant.findFirst({
    where: { usuario_id, tenant_id, status: "ATIVO", deleted_at: null },
  });

  if (!ut) throw new Error("Vínculo não encontrado para este tenant");

  return { perfil: ut.perfil, tenant_id };
}

// =============================================
// SELECIONAR TENANT — GERA JWT DEFINITIVO
// =============================================

export async function selecionarTenant(
  usuario_id: number,
  tenant_id: number,
) {
  const usuarioTenant = await prisma.usuarioTenant.findFirst({
    where: { usuario_id, tenant_id, status: "ATIVO", deleted_at: null },
    include: {
      usuario: { select: { id: true, nome: true, email: true } },
    },
  });

  if (!usuarioTenant) {
    throw new Error("Usuario nao tem acesso a este tenant");
  }

  const nivel = usuarioTenant.nivel_atual;
  const perfil = usuarioTenant.perfil;

  const token = jwt.sign(
    { id: usuario_id, email: usuarioTenant.usuario.email, tenant_id, nivel, perfil },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions,
  );

  await prisma.auditoriaLog.create({
    data: {
      tenant_id,
      usuario_id,
      tipo_log: "ACESSO",
      acao: "SELECIONAR_TENANT",
      valor_novo: { tenant_id },
    },
  });

  return {
    token,
    usuario: {
      id: usuarioTenant.usuario.id,
      nome: usuarioTenant.usuario.nome,
      email: usuarioTenant.usuario.email,
      nivel,
      tenant_id,
    },
  };
}
