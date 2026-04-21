import { Router } from 'express';
import { prisma } from '../lib/db.js';
import { requireAuth, requireMod } from '../middleware/auth.js';
import { audit } from '../lib/audit.js';

export const announcementsRouter = Router();
announcementsRouter.use(requireAuth);

const authorSelect = { id: true, name: true, handle: true, color: true };

announcementsRouter.get('/', async (req, res) => {
  const items = await prisma.announcement.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: { author: { select: authorSelect } },
  });
  res.json({ announcements: items });
});

announcementsRouter.post('/', requireMod, async (req, res) => {
  const { title, body, priority = 'medium' } = req.body || {};
  if (!title) return res.status(400).json({ error: 'title obrigatório' });
  const a = await prisma.announcement.create({
    data: {
      title: String(title).slice(0, 200),
      body: body ? String(body).slice(0, 5000) : null,
      authorId: req.user.id,
      priority: ['high', 'medium', 'low'].includes(priority) ? priority : 'medium',
    },
    include: { author: { select: authorSelect } },
  });
  await audit(req.user.id, 'announcement_created', a.id, { title }, req);
  res.json({ announcement: a });
});

announcementsRouter.delete('/:id', requireMod, async (req, res) => {
  await prisma.announcement.delete({ where: { id: req.params.id } });
  await audit(req.user.id, 'announcement_deleted', req.params.id, null, req);
  res.json({ ok: true });
});
