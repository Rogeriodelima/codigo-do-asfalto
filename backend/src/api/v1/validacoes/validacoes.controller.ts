import { Request, Response } from "express";
import {
  validarExperiencia,
  listarFilaValidacao,
  notificarValidadores,
} from "./validacoes.service";

// GET /api/v1/validacoes/fila
export async function getFila(req: Request, res: Response) {
  try {
    const tenant_id = req.usuario!.tenant_id;
    const resultado = await listarFilaValidacao(tenant_id);
    return res.status(200).json(resultado);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

// POST /api/v1/validacoes/:experiencia_id
export async function postValidacao(req: Request, res: Response) {
  try {
    const validador_id = req.usuario!.id;
    const tenant_id = req.usuario!.tenant_id;
    const experiencia_id = Number(req.params.experiencia_id);
    const { acao, observacao } = req.body;

    const acoesValidas = [
      "APROVADA",
      "APROVADA_DESTAQUE",
      "EM_REVISAO",
      "REJEITADA",
    ];
    if (!acao || !acoesValidas.includes(acao)) {
      return res.status(400).json({
        error: `Acao invalida. Use: ${acoesValidas.join(", ")}`,
      });
    }

    const resultado = await validarExperiencia(
      experiencia_id,
      validador_id,
      tenant_id,
      { acao, observacao },
    );

    return res.status(200).json(resultado);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

// POST /api/v1/validacoes/:experiencia_id/notificar
export async function postNotificar(req: Request, res: Response) {
  try {
    const tenant_id = req.usuario!.tenant_id;
    const experiencia_id = Number(req.params.experiencia_id);

    await notificarValidadores(experiencia_id, tenant_id);

    return res.status(200).json({ message: "Validadores notificados" });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}
