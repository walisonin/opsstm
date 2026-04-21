import { Router } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import { prisma } from '../lib/db.js';
import { signToken } from '../lib/jwt.js';
import { requireAuth } from '../middleware/auth.js';
import { audit } from '../lib/audit.js';

const UPLOAD_DIR = process.env.UPLOAD_DIR || '/uploads';
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const imageUpload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (req, file, cb) => {
      const ext = (path.extname(file.originalname) || '').toLowerCase().replace(/[^a-z0-9.]/g, '').slice(0, 6);
      cb(null, `${crypto.randomBytes(12).toString('hex')}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(null, /^image\/(jpeg|png|webp|gif)$/i.test(file.mimetype)),
});

export const authRouter = Router();

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true });

authRouter.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email e senha obrigatórios' });

  const user = await prisma.user.findUnique({ where: { email: String(email).toLowerCase().trim() } });
  if (!user || !user.active) return res.status(401).json({ error: 'Credenciais inválidas' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    await audit(user.id, 'login_failed', null, null, req);
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastSeen: new Date(), status: 'online' },
  });

  const token = signToken({ sub: user.id, role: user.role });
  res.cookie('stm_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  await audit(user.id, 'login', null, null, req);

  const { passwordHash, ...safe } = user;
  res.json({ token, user: safe });
});

authRouter.post('/logout', requireAuth, async (req, res) => {
  await prisma.user.update({ where: { id: req.user.id }, data: { status: 'offline' } });
  res.clearCookie('stm_token');
  await audit(req.user.id, 'logout', null, null, req);
  res.json({ ok: true });
});

authRouter.get('/me', requireAuth, async (req, res) => {
  const { passwordHash, ...safe } = req.user;
  res.json({ user: safe });
});

authRouter.patch('/me', requireAuth, async (req, res) => {
  const { bio, signature, status, color, title } = req.body || {};
  const data = {};
  if (bio !== undefined) data.bio = String(bio).slice(0, 500);
  if (signature !== undefined) data.signature = String(signature).slice(0, 200);
  if (status !== undefined && ['online', 'away', 'dnd', 'offline'].includes(status)) data.status = status;
  if (color !== undefined) data.color = String(color).slice(0, 9);
  if (title !== undefined) data.title = String(title).slice(0, 40);

  const user = await prisma.user.update({ where: { id: req.user.id }, data });
  const { passwordHash, ...safe } = user;
  res.json({ user: safe });
});

authRouter.post('/change-password', requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!newPassword || newPassword.length < 8) return res.status(400).json({ error: 'Senha precisa ter 8+ caracteres' });

  if (!req.user.mustChangePw) {
    if (!currentPassword) return res.status(400).json({ error: 'Senha atual obrigatória' });
    const ok = await bcrypt.compare(currentPassword, req.user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Senha atual incorreta' });
  }

  const hash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: req.user.id },
    data: { passwordHash: hash, mustChangePw: false },
  });

  await audit(req.user.id, 'password_changed', null, null, req);
  res.json({ ok: true });
});

function tryUnlinkFromUrl(url) {
  if (!url || !url.startsWith('/api/uploads/')) return;
  const filename = url.replace('/api/uploads/', '').replace(/[^a-zA-Z0-9.]/g, '');
  const filepath = path.join(UPLOAD_DIR, filename);
  fs.unlink(filepath, () => {});
}

authRouter.post('/me/avatar', requireAuth, imageUpload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Imagem inválida (jpg/png/webp/gif até 5MB)' });
  const url = `/api/uploads/${req.file.filename}`;
  tryUnlinkFromUrl(req.user.avatar);
  const user = await prisma.user.update({ where: { id: req.user.id }, data: { avatar: url } });
  await audit(req.user.id, 'avatar_updated', null, null, req);
  const { passwordHash, ...safe } = user;
  res.json({ user: safe });
});

authRouter.delete('/me/avatar', requireAuth, async (req, res) => {
  tryUnlinkFromUrl(req.user.avatar);
  const user = await prisma.user.update({ where: { id: req.user.id }, data: { avatar: null } });
  const { passwordHash, ...safe } = user;
  res.json({ user: safe });
});

authRouter.post('/me/cover', requireAuth, imageUpload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Imagem inválida (jpg/png/webp/gif até 5MB)' });
  const url = `/api/uploads/${req.file.filename}`;
  tryUnlinkFromUrl(req.user.coverImage);
  const user = await prisma.user.update({ where: { id: req.user.id }, data: { coverImage: url } });
  await audit(req.user.id, 'cover_updated', null, null, req);
  const { passwordHash, ...safe } = user;
  res.json({ user: safe });
});

authRouter.delete('/me/cover', requireAuth, async (req, res) => {
  tryUnlinkFromUrl(req.user.coverImage);
  const user = await prisma.user.update({ where: { id: req.user.id }, data: { coverImage: null } });
  const { passwordHash, ...safe } = user;
  res.json({ user: safe });
});
