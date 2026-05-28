import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export interface TokenPayload {
  id: number;
  email: string;
  tenant_id: number;
  nivel: number;
  perfil: string;
}

declare global {
  namespace Express {
    interface Request {
      usuario?: TokenPayload;
    }
  }
}

export function autenticar(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Token nao fornecido" });
    }

    const token = authHeader.split(" ")[1];

    const payload = jwt.verify(token, JWT_SECRET) as TokenPayload;
    req.usuario = payload;

    return next();
  } catch (error) {
    return res.status(401).json({ error: "Token invalido ou expirado" });
  }
}

export function autenticarAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  autenticar(req, res, () => {
    if (!req.usuario) {
      return res.status(401).json({ error: "Nao autenticado" });
    }
    // TODO: verificar perfil admin no banco
    // Por ora passa direto para estrutura estar pronta
    return next();
  });
}
