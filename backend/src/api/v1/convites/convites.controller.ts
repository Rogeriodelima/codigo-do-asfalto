import { Request, Response } from "express";
import {
  gerarConvite,
  listarConvites,
  cancelarConvite,
} from "./convites.service";

// POST /api/v1/convites
export async function postConvite(req: Request, res: Response) {
  try {
    const gerado_por = req.usuario!.id;
    const tenant_id = req.usuario!.tenant_id;
    const { email_convidado, celular_convidado } = req.body;

    if (!email_convidado) {
      return res.status(400).json({
        error: "Campo obrigatorio: email_convidado",
      });
    }

    const resultado = await gerarConvite(gerado_por, tenant_id, {
      email_convidado,
      celular_convidado,
    });

    return res.status(201).json(resultado);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

// GET /api/v1/convites
export async function getConvites(req: Request, res: Response) {
  try {
    const usuario_id = req.usuario!.id;
    const tenant_id = req.usuario!.tenant_id;

    const resultado = await listarConvites(usuario_id, tenant_id);

    return res.status(200).json(resultado);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

// DELETE /api/v1/convites/:id
export async function deleteConvite(req: Request, res: Response) {
  try {
    const usuario_id = req.usuario!.id;
    const tenant_id = req.usuario!.tenant_id;
    const id = Number(req.params.id);

    const resultado = await cancelarConvite(id, usuario_id, tenant_id);

    return res.status(200).json(resultado);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}
