import { Router } from 'express';
import { prisma } from '../lib/db.js';
import { requireAuth } from '../middleware/auth.js';

export const usersRouter = Router();
usersRouter.use(requireAuth);

const publicFields = {
  id: true, email: true, handle: true, name: true, role: true, status: true,
  color: true, bio: true, title: true, roleDesc: true, reputation: true,
  postCount: true, signature: true, avatar: true, coverImage: true,
  joined: true, lastSeen: true, active: true,
};

usersRouter.get('/', async (req, res) => {
  const users = await prisma.user.findMany({
    where: { active: true },
    select: publicFields,
    orderBy: [{ status: 'asc' }, { name: 'asc' }],
  });
  res.json({ users });
});

usersRouter.get('/online', async (req, res) => {
  const users = await prisma.user.findMany({
    where: { active: true, status: 'online' },
    select: publicFields,
    orderBy: { name: 'asc' },
  });
  res.json({ users });
});

usersRouter.get('/:id', async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id }, select: publicFields });
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
  res.json({ user });
});
