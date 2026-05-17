import { Request, Response, NextFunction } from "express";
import { prisma } from "../utils/prisma";

export async function validarTenant(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const tenant_id = req.usuario?.tenant_id;

    if (!tenant_id) {
      return res.status(401).json({ error: "Tenant nao identificado" });
    }

    const tenant = await prisma.tenant.findFirst({
      where: {
        id: tenant_id,
        ativo: true,
        deleted_at: null,
      },
    });

    if (!tenant) {
      return res.status(403).json({ error: "Tenant invalido ou inativo" });
    }

    return next();
  } catch (error) {
    return res.status(500).json({ error: "Erro ao validar tenant" });
  }
}
