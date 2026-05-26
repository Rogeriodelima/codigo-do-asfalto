import { prisma } from "../../../utils/prisma";

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
