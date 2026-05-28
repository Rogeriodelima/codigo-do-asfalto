import { Request, Response, NextFunction } from "express";
import { prisma } from "../utils/prisma";

// Middleware de auditoria automática para operações de escrita.
// Usa res.on("finish") para não bloquear a resposta — falhas silenciosas
// para que um erro de log jamais interrompa o fluxo da requisição.
export function registrarAuditoria(tabela: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    res.on("finish", async () => {
      if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) return;
      if (res.statusCode < 200 || res.statusCode >= 300) return;

      try {
        const tenant_id =
          req.usuario?.tenant_id && req.usuario.tenant_id > 0
            ? req.usuario.tenant_id
            : null;

        await prisma.auditoriaLog.create({
          data: {
            tenant_id,
            usuario_id: req.usuario?.id ?? null,
            tipo_log: "ACAO",
            tabela,
            registro_id: req.params.id ? Number(req.params.id) : null,
            acao: req.method,
            valor_novo:
              req.body && Object.keys(req.body).length > 0
                ? req.body
                : undefined,
            ip: req.ip,
            user_agent: req.headers["user-agent"] ?? null,
          },
        });
      } catch {
        // auditoria nunca deve interromper o fluxo
      }
    });

    next();
  };
}
