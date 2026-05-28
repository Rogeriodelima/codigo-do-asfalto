import { Request, Response } from "express";
import {
  listarEquipamentos,
  buscarEquipamento,
  criarEquipamento,
  atualizarEquipamento,
  desativarEquipamento,
  atualizarFotoEquipamento,
} from "./equipamentos.service";

const MIME_PERMITIDOS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

// GET /api/v1/equipamentos
export async function getEquipamentos(req: Request, res: Response) {
  try {
    const usuario_id = req.usuario!.id;
    const tenant_id = req.usuario!.tenant_id;
    const resultado = await listarEquipamentos(usuario_id, tenant_id);
    return res.status(200).json(resultado);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

// GET /api/v1/equipamentos/:id
export async function getEquipamento(req: Request, res: Response) {
  try {
    const usuario_id = req.usuario!.id;
    const tenant_id = req.usuario!.tenant_id;
    const id = Number(req.params.id);
    const resultado = await buscarEquipamento(id, usuario_id, tenant_id);
    return res.status(200).json(resultado);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

// POST /api/v1/equipamentos
export async function postEquipamento(req: Request, res: Response) {
  try {
    const usuario_id = req.usuario!.id;
    const tenant_id = req.usuario!.tenant_id;
    const { tipo_produto, modelo, categoria, ano, cor, identificador } =
      req.body;

    if (!modelo) {
      return res.status(400).json({ error: "Campo obrigatorio: modelo" });
    }

    const resultado = await criarEquipamento(usuario_id, tenant_id, {
      tipo_produto,
      modelo,
      categoria,
      ano,
      cor,
      identificador,
    });

    return res.status(201).json(resultado);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

// PUT /api/v1/equipamentos/:id
export async function putEquipamento(req: Request, res: Response) {
  try {
    const usuario_id = req.usuario!.id;
    const tenant_id = req.usuario!.tenant_id;
    const id = Number(req.params.id);
    const { modelo, categoria, ano, cor, identificador } = req.body;

    const resultado = await atualizarEquipamento(id, usuario_id, tenant_id, {
      modelo,
      categoria,
      ano,
      cor,
      identificador,
    });

    return res.status(200).json(resultado);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

// POST /api/v1/equipamentos/:id/foto
export async function postFotoEquipamento(req: Request, res: Response) {
  try {
    const usuario_id = req.usuario!.id;
    const tenant_id = req.usuario!.tenant_id;
    const id = Number(req.params.id);

    if (!req.file) {
      return res.status(400).json({ error: "Arquivo nao enviado" });
    }

    const contentType = req.file.mimetype;
    const extensao = MIME_PERMITIDOS[contentType];

    if (!extensao) {
      return res
        .status(400)
        .json({ error: "Tipo de arquivo invalido. Use jpeg, png ou webp" });
    }

    const url = await atualizarFotoEquipamento(
      id,
      usuario_id,
      tenant_id,
      req.file.buffer,
      contentType,
      extensao,
    );

    return res.status(200).json({ foto_url: url });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// DELETE /api/v1/equipamentos/:id
export async function deleteEquipamento(req: Request, res: Response) {
  try {
    const usuario_id = req.usuario!.id;
    const tenant_id = req.usuario!.tenant_id;
    const id = Number(req.params.id);
    const resultado = await desativarEquipamento(id, usuario_id, tenant_id);
    return res.status(200).json(resultado);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}
