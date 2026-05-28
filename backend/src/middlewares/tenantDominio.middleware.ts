import { Request, Response, NextFunction } from "express";
import { prisma } from "../utils/prisma";

declare global {
  namespace Express {
    interface Request {
      tenantDominioId?: number;
    }
  }
}

/**
 * Identifica o tenant pelo cabeçalho Host da requisição.
 * Se encontrar um tenant com dominio = host, injeta req.tenantDominioId.
 * Caso contrário, deixa passar sem erro — o tenant continuará sendo
 * resolvido pelo JWT como de costume.
 */
export async function tenantDominio(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    const host = (req.headers.host ?? "").split(":")[0].toLowerCase();

    if (host) {
      const tenant = await prisma.tenant.findFirst({
        where: { dominio: host, ativo: true, deleted_at: null },
        select: { id: true },
      });

      if (tenant) {
        req.tenantDominioId = tenant.id;
      }
    }
  } catch {
    // Falha silenciosa — não bloqueia a requisição
  }

  return next();
}
