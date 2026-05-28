import { Request, Response } from "express";
import { listarLogs } from "./auditoria.service";

// =============================================
// LISTAR LOGS
// =============================================

export async function getLogs(req: Request, res: Response) {
  try {
    const tenant_id = req.usuario!.tenant_id;
    const { tabela, usuario_id, acao, data_inicio, data_fim, page, limit } =
      req.query;

    const resultado = await listarLogs(tenant_id, {
      tabela: tabela as string | undefined,
      usuario_id: usuario_id ? Number(usuario_id) : undefined,
      acao: acao as string | undefined,
      data_inicio: data_inicio as string | undefined,
      data_fim: data_fim as string | undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Math.min(Number(limit), 100) : 50,
    });

    return res.status(200).json(resultado);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}
