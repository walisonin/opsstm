import { Router } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { prisma } from '../lib/db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { audit } from '../lib/audit.js';

export const adminRouter = Router();
adminRouter.use(requireAuth, requireAdmin);

const ROLES = ['super_admin', 'admin', 'moderator', 'member'];
const COLORS = ['#9fb42c', '#7e3f62', '#1f6fb8', '#ea431b', '#eeb23e', '#1f8a8a', '#f2801f', '#c72124', '#947034', '#b4c93d'];

function randomPassword(length = 14) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  const bytes = crypto.randomBytes(length);
  let pw = '';
  for (let i = 0; i < length; i++) pw += chars[bytes[i] % chars.length];
  return pw;
}

adminRouter.get('/users', async (req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true, email: true, handle: true, name: true, role: true, status: true,
      color: true, title: true, roleDesc: true, joined: true, lastSeen: true, active: true,
      postCount: true, reputation: true, mustChangePw: true,
    },
  });
  res.json({ users });
});

adminRouter.post('/users', async (req, res) => {
  const { name, email, handle, role = 'member', roleDesc, title, color, password } = req.body || {};
  if (!name || !email) return res.status(400).json({ error: 'name e email obrigatórios' });
  if (!ROLES.includes(role)) return res.status(400).json({ error: 'role inválido' });
  if (role === 'super_admin' && req.user.role !== 'super_admin')
    return res.status(403).json({ error: 'Apenas super admin pode criar super admin' });

  const finalEmail = String(email).toLowerCase().trim();
  const finalHandle = handle
    ? String(handle).toLowerCase().replace(/[^a-z0-9._-]/g, '')
    : finalEmail.split('@')[0].replace(/[^a-z0-9._-]/g, '');

  const exists = await prisma.user.findFirst({ where: { OR: [{ email: finalEmail }, { handle: finalHandle }] } });
  if (exists) return res.status(409).json({ error: 'Email ou handle já existe' });

  const pw = password || randomPassword();
  const hash = await bcrypt.hash(pw, 12);
  const finalColor = color || COLORS[Math.floor(Math.random() * COLORS.length)];

  const user = await prisma.user.create({
    data: {
      email: finalEmail,
      handle: finalHandle,
      name: String(name).slice(0, 80),
      passwordHash: hash,
      role,
      color: finalColor,
      roleDesc: roleDesc || null,
      title: title || null,
      mustChangePw: true,
    },
  });

  await audit(req.user.id, 'user_invited', user.id, { email: finalEmail }, req);

  res.json({
    user: { ...user, passwordHash: undefined },
    tempPassword: pw,
  });
});

adminRouter.patch('/users/:id', async (req, res) => {
  const target = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!target) return res.status(404).json({ error: 'Usuário não encontrado' });

  const { name, email, role, roleDesc, title, color, active } = req.body || {};
  const data = {};
  if (name !== undefined) data.name = String(name).slice(0, 80);
  if (email !== undefined) data.email = String(email).toLowerCase().trim();
  if (role !== undefined) {
    if (!ROLES.includes(role)) return res.status(400).json({ error: 'role inválido' });
    if (target.role === 'super_admin' && req.user.role !== 'super_admin')
      return res.status(403).json({ error: 'Apenas super admin pode alterar super admin' });
    if (role === 'super_admin' && req.user.role !== 'super_admin')
      return res.status(403).json({ error: 'Apenas super admin pode promover a super admin' });
    data.role = role;
  }
  if (roleDesc !== undefined) data.roleDesc = roleDesc;
  if (title !== undefined) data.title = title;
  if (color !== undefined) data.color = color;
  if (active !== undefined) data.active = !!active;

  const user = await prisma.user.update({ where: { id: target.id }, data });
  await audit(req.user.id, 'user_updated', user.id, data, req);
  res.json({ user: { ...user, passwordHash: undefined } });
});

adminRouter.post('/users/:id/reset-password', async (req, res) => {
  const target = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!target) return res.status(404).json({ error: 'Usuário não encontrado' });
  if (target.role === 'super_admin' && req.user.role !== 'super_admin')
    return res.status(403).json({ error: 'Sem permissão' });

  const pw = randomPassword();
  const hash = await bcrypt.hash(pw, 12);
  await prisma.user.update({ where: { id: target.id }, data: { passwordHash: hash, mustChangePw: true } });
  await audit(req.user.id, 'password_reset', target.id, null, req);
  res.json({ tempPassword: pw });
});

adminRouter.delete('/users/:id', async (req, res) => {
  const target = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!target) return res.status(404).json({ error: 'Usuário não encontrado' });
  if (target.role === 'super_admin') return res.status(403).json({ error: 'Não pode excluir super admin' });
  if (target.id === req.user.id) return res.status(400).json({ error: 'Não pode excluir a si mesmo' });

  await prisma.user.update({ where: { id: target.id }, data: { active: false } });
  await audit(req.user.id, 'user_disabled', target.id, null, req);
  res.json({ ok: true });
});

adminRouter.get('/audit-logs', async (req, res) => {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: { user: { select: { id: true, name: true, handle: true, color: true } } },
  });
  res.json({ logs });
});

adminRouter.get('/stats', async (req, res) => {
  const [users, onlineUsers, topics, posts, messages, vaultItems] = await Promise.all([
    prisma.user.count({ where: { active: true } }),
    prisma.user.count({ where: { active: true, status: 'online' } }),
    prisma.forumTopic.count(),
    prisma.forumPost.count(),
    prisma.chatMessage.count({ where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }),
    prisma.vaultItem.count(),
  ]);
  res.json({ stats: { users, onlineUsers, topics, posts, messagesToday: messages, vaultItems } });
});
