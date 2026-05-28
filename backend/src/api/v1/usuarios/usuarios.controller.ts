import { Request, Response } from "express";
import { buscarTenantsPorUsuario, selecionarTenant } from "./usuarios.service";

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

// =============================================
// SELECIONAR TENANT — EMITE JWT DEFINITIVO
// =============================================

export async function postSelecionarTenant(req: Request, res: Response) {
  try {
    const usuario_id = req.usuario!.id;
    const { tenant_id } = req.body;

    if (!tenant_id) {
      return res.status(400).json({ error: "Campo obrigatorio: tenant_id" });
    }

    const resultado = await selecionarTenant(usuario_id, Number(tenant_id));
    return res.status(200).json(resultado);
  } catch (error: any) {
    return res.status(403).json({ error: error.message });
  }
}
