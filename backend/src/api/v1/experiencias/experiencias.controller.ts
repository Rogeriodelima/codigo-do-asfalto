import { Request, Response } from "express";
import {
  listarExperiencias,
  buscarExperiencia,
  criarExperiencia,
  atualizarExperiencia,
  deletarExperiencia,
} from "./experiencias.service";

// GET /api/v1/experiencias
export async function getExperiencias(req: Request, res: Response) {
  try {
    const usuario_id = req.usuario!.id;
    const tenant_id = req.usuario!.tenant_id;
    const { tipo, status_validacao } = req.query;

    const resultado = await listarExperiencias(usuario_id, tenant_id, {
      tipo: tipo as string,
      status_validacao: status_validacao as string,
    });

    return res.status(200).json(resultado);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

// GET /api/v1/experiencias/:id
export async function getExperiencia(req: Request, res: Response) {
  try {
    const usuario_id = req.usuario!.id;
    const tenant_id = req.usuario!.tenant_id;
    const id = Number(req.params.id);

    const resultado = await buscarExperiencia(id, usuario_id, tenant_id);
    return res.status(200).json(resultado);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

// POST /api/v1/experiencias
export async function postExperiencia(req: Request, res: Response) {
  try {
    const usuario_id = req.usuario!.id;
    const tenant_id = req.usuario!.tenant_id;
    const {
      tipo,
      titulo,
      descricao,
      data,
      localizacao,
      distancia_ou_duracao,
      participantes,
    } = req.body;

    if (!tipo || !titulo || !data) {
      return res.status(400).json({
        error: "Campos obrigatorios: tipo, titulo, data",
      });
    }

    const resultado = await criarExperiencia(usuario_id, tenant_id, {
      tipo,
      titulo,
      descricao,
      data: new Date(data),
      localizacao,
      distancia_ou_duracao,
      participantes,
    });

    return res.status(201).json(resultado);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

// PUT /api/v1/experiencias/:id
export async function putExperiencia(req: Request, res: Response) {
  try {
    const usuario_id = req.usuario!.id;
    const tenant_id = req.usuario!.tenant_id;
    const id = Number(req.params.id);
    const {
      titulo,
      descricao,
      localizacao,
      distancia_ou_duracao,
      participantes,
    } = req.body;

    const resultado = await atualizarExperiencia(id, usuario_id, tenant_id, {
      titulo,
      descricao,
      localizacao,
      distancia_ou_duracao,
      participantes,
    });

    return res.status(200).json(resultado);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

// DELETE /api/v1/experiencias/:id
export async function deleteExperiencia(req: Request, res: Response) {
  try {
    const usuario_id = req.usuario!.id;
    const tenant_id = req.usuario!.tenant_id;
    const id = Number(req.params.id);

    const resultado = await deletarExperiencia(id, usuario_id, tenant_id);
    return res.status(200).json(resultado);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}
