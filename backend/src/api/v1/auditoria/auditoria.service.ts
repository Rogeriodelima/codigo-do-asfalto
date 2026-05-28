import { prisma } from "../../../utils/prisma";

// =============================================
// LISTAR LOGS DE AUDITORIA
// =============================================

export interface FiltrosAuditoria {
  tabela?: string;
  usuario_id?: number;
  acao?: string;
  data_inicio?: string;
  data_fim?: string;
  page?: number;
  limit?: number;
}

export async function listarLogs(
  tenant_id: number,
  filtros: FiltrosAuditoria,
) {
  const {
    tabela,
    usuario_id,
    acao,
    data_inicio,
    data_fim,
    page = 1,
    limit = 50,
  } = filtros;

  const where: Record<string, unknown> = { tenant_id };

  if (tabela) where.tabela = tabela;
  if (usuario_id) where.usuario_id = usuario_id;
  if (acao) where.acao = { contains: acao, mode: "insensitive" };
  if (data_inicio || data_fim) {
    const intervalo: Record<string, Date> = {};
    if (data_inicio) intervalo.gte = new Date(data_inicio);
    if (data_fim) intervalo.lte = new Date(data_fim);
    where.created_at = intervalo;
  }

  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    prisma.auditoriaLog.findMany({
      where,
      include: {
        usuario: { select: { id: true, nome: true, email: true } },
      },
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
    }),
    prisma.auditoriaLog.count({ where }),
  ]);

  return {
    logs,
    total,
    page,
    limit,
    paginas: Math.ceil(total / limit),
  };
}
