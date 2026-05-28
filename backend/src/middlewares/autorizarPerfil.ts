import { Request, Response, NextFunction } from "express";

export type PerfilTenant = "MEMBRO" | "VALIDADOR" | "GESTOR" | "ADMIN";

// Hierarquia crescente de permissão — índice = rank.
const HIERARQUIA: PerfilTenant[] = ["MEMBRO", "VALIDADOR", "GESTOR", "ADMIN"];

// Factory que aceita um ou mais perfis permitidos.
// O acesso é liberado se o perfil do usuário tiver rank >= ao menor rank listado.
// Exemplo: autorizarPerfil("GESTOR", "ADMIN") exige pelo menos GESTOR.
export function autorizarPerfil(...perfis: PerfilTenant[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.usuario) {
      return res.status(401).json({ error: "Nao autenticado" });
    }

    const perfilUsuario = req.usuario.perfil as PerfilTenant;
    const rankUsuario = HIERARQUIA.indexOf(perfilUsuario);
    const rankMinimo = Math.min(...perfis.map((p) => HIERARQUIA.indexOf(p)));

    if (rankUsuario < rankMinimo) {
      return res.status(403).json({
        error: `Acesso restrito. Perfil necessario: ${perfis.join(" ou ")}`,
      });
    }

    return next();
  };
}
