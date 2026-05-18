import { Request, Response } from "express";
import {
  listarConteudos,
  buscarConteudo,
  buscarRecomendacoes,
  criarConteudo,
  atualizarConteudo,
} from "./conteudos.service";

// GET /api/v1/conteudos
export async function getConteudos(req: Request, res: Response) {
  try {
    const tenant_id = req.usuario!.tenant_id;
    const nivel_usuario = req.usuario!.nivel || 1;
    const { tipo, busca } = req.query;

    const resultado = await listarConteudos(tenant_id, nivel_usuario, {
      tipo: tipo as string,
      busca: busca as string,
    });

    return res.status(200).json(resultado);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

// GET /api/v1/conteudos/recomendacoes
export async function getRecomendacoes(req: Request, res: Response) {
  try {
    const tenant_id = req.usuario!.tenant_id;
    const nivel_usuario = req.usuario!.nivel || 1;

    const resultado = await buscarRecomendacoes(tenant_id, nivel_usuario);
    return res.status(200).json(resultado);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

// GET /api/v1/conteudos/:id
export async function getConteudo(req: Request, res: Response) {
  try {
    const tenant_id = req.usuario!.tenant_id;
    const id = Number(req.params.id);

    const resultado = await buscarConteudo(id, tenant_id);
    return res.status(200).json(resultado);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

// POST /api/v1/conteudos (admin)
export async function postConteudo(req: Request, res: Response) {
  try {
    const tenant_id = req.usuario!.tenant_id;
    const {
      titulo,
      descricao,
      corpo,
      tipo,
      nivel_recomendado,
      tempo_leitura_min,
      thumbnail_url,
    } = req.body;

    if (!titulo || !tipo) {
      return res
        .status(400)
        .json({ error: "Campos obrigatorios: titulo, tipo" });
    }

    const resultado = await criarConteudo(tenant_id, {
      titulo,
      descricao,
      corpo,
      tipo,
      nivel_recomendado,
      tempo_leitura_min,
      thumbnail_url,
    });

    return res.status(201).json(resultado);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

// PUT /api/v1/conteudos/:id (admin)
export async function putConteudo(req: Request, res: Response) {
  try {
    const tenant_id = req.usuario!.tenant_id;
    const id = Number(req.params.id);
    const {
      titulo,
      descricao,
      corpo,
      tipo,
      nivel_recomendado,
      tempo_leitura_min,
      thumbnail_url,
      ativo,
    } = req.body;

    const resultado = await atualizarConteudo(id, tenant_id, {
      titulo,
      descricao,
      corpo,
      tipo,
      nivel_recomendado,
      tempo_leitura_min,
      thumbnail_url,
      ativo,
    });

    return res.status(200).json(resultado);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}
