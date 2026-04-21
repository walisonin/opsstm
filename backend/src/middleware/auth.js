import { verifyToken } from '../lib/jwt.js';
import { prisma } from '../lib/db.js';

export async function requireAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : req.cookies?.stm_token;
  if (!token) return res.status(401).json({ error: 'Não autenticado' });

  const decoded = verifyToken(token);
  if (!decoded?.sub) return res.status(401).json({ error: 'Token inválido' });

  const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
  if (!user || !user.active) return res.status(401).json({ error: 'Usuário não encontrado' });

  req.user = user;
  next();
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Não autenticado' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Acesso negado' });
    next();
  };
}

export const requireAdmin = requireRole('super_admin', 'admin');
export const requireMod = requireRole('super_admin', 'admin', 'moderator');
