import { Request, Response } from "express";
import { buscarTenantsPorUsuario } from "./usuarios.service";

// =============================================
// LISTAR TENANTS DO USUÁRIO AUTENTICADO
// =============================================

export async function getMeTenants(req: Request, res: Response) {
  try {
    const usuario_id = req.usuario!.id;
    const tenants = await buscarTenantsPorUsuario(usuario_id);
    return res.status(200).json(tenants);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}
