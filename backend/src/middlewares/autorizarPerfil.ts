import { Request, Response, NextFunction } from "express";

// Hierarquia de perfis mapeada para o campo nivel_atual do UsuarioTenant.
// O JWT já carrega `nivel` (= nivel_atual na época do login), portanto a
// verificação é síncrona e não exige round-trip ao banco.
export const PERFIS = {
  MEMBRO: 1,
  VALIDADOR: 2,
  GESTOR: 5,
  ADMIN: 10,
} as const;

export type Perfil = keyof typeof PERFIS;

// Factory que aceita um ou mais perfis permitidos.
// O acesso é liberado se o nivel do usuário for >= ao menor nivel listado.
// Exemplo: autorizarPerfil("GESTOR", "ADMIN") permite nivel >= 5.
export function autorizarPerfil(...perfis: Perfil[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.usuario) {
      return res.status(401).json({ error: "Nao autenticado" });
    }

    const nivelUsuario = req.usuario.nivel ?? 0;
    const nivelMinimo = Math.min(...perfis.map((p) => PERFIS[p]));

    if (nivelUsuario < nivelMinimo) {
      return res.status(403).json({
        error: `Acesso restrito. Perfil necessario: ${perfis.join(" ou ")}`,
      });
    }

    return next();
  };
}
