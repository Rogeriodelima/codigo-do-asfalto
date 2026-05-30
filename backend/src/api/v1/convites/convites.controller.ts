import { Request, Response } from "express";
import {
  gerarConvite,
  listarConvites,
  cancelarConvite,
  validarConvite,
} from "./convites.service";

// POST /api/v1/convites/validar
export async function postValidarConvite(req: Request, res: Response) {
  try {
    const { codigo, email } = req.body;

    if (!codigo) {
      return res.status(400).json({ error: "Campo obrigatorio: codigo" });
    }

    const resultado = await validarConvite({ codigo, email });

    return res.status(200).json(resultado);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

// POST /api/v1/convites
export async function postConvite(req: Request, res: Response) {
  try {
    const gerado_por = req.usuario!.id;
    const tenant_id = req.usuario!.tenant_id;
    const { email_convidado, celular_convidado, canal } = req.body;

    const CANAIS_VALIDOS = ["EMAIL", "WHATSAPP", "AMBOS"];
    if (!canal || !CANAIS_VALIDOS.includes(canal)) {
      return res.status(400).json({
        error: "Campo obrigatorio: canal (EMAIL, WHATSAPP ou AMBOS)",
      });
    }

    if ((canal === "EMAIL" || canal === "AMBOS") && !email_convidado) {
      return res.status(400).json({
        error: "Campo obrigatorio: email_convidado para canal EMAIL ou AMBOS",
      });
    }

    if ((canal === "WHATSAPP" || canal === "AMBOS") && !celular_convidado) {
      return res.status(400).json({
        error: "Campo obrigatorio: celular_convidado para canal WHATSAPP ou AMBOS",
      });
    }

    const resultado = await gerarConvite(gerado_por, tenant_id, {
      email_convidado,
      celular_convidado,
      canal,
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
