import { Request, Response } from "express";
import { buscarEvolucao, buscarDashboard } from "./evolucao.service";

// GET /api/v1/evolucao
export async function getEvolucao(req: Request, res: Response) {
  try {
    const usuario_id = req.usuario!.id;
    const tenant_id = req.usuario!.tenant_id;
    const resultado = await buscarEvolucao(usuario_id, tenant_id);
    return res.status(200).json(resultado);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

// GET /api/v1/evolucao/dashboard
export async function getDashboard(req: Request, res: Response) {
  try {
    const usuario_id = req.usuario!.id;
    const tenant_id = req.usuario!.tenant_id;
    const resultado = await buscarDashboard(usuario_id, tenant_id);
    return res.status(200).json(resultado);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}
