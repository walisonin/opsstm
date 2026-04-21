import { Router } from 'express';
import { prisma } from '../lib/db.js';
import { requireAuth } from '../middleware/auth.js';
import { audit } from '../lib/audit.js';

export const shortcutsRouter = Router();
shortcutsRouter.use(requireAuth);

shortcutsRouter.get('/', async (req, res) => {
  const shortcuts = await prisma.shortcut.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] });
  res.json({ shortcuts });
});

shortcutsRouter.post('/', async (req, res) => {
  const { label, url, icon = 'link', color = '#9fb42c' } = req.body || {};
  if (!label || !url) return res.status(400).json({ error: 'label e url obrigatórios' });

  const max = await prisma.shortcut.aggregate({ _max: { order: true } });
  const sc = await prisma.shortcut.create({
    data: {
      label: String(label).slice(0, 80),
      url: String(url).slice(0, 500),
      icon: String(icon).slice(0, 30),
      color: String(color).slice(0, 9),
      order: (max._max.order ?? 0) + 1,
      createdById: req.user.id,
    },
  });
  await audit(req.user.id, 'shortcut_created', sc.id, { label: sc.label }, req);
  res.json({ shortcut: sc });
});

shortcutsRouter.patch('/:id', async (req, res) => {
  const existing = await prisma.shortcut.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: 'Direcionamento não encontrado' });

  const { label, url, icon, color, order } = req.body || {};
  const data = {};
  if (label !== undefined) data.label = String(label).slice(0, 80);
  if (url !== undefined) data.url = String(url).slice(0, 500);
  if (icon !== undefined) data.icon = String(icon).slice(0, 30);
  if (color !== undefined) data.color = String(color).slice(0, 9);
  if (order !== undefined) data.order = Number(order) || 0;

  const sc = await prisma.shortcut.update({ where: { id: req.params.id }, data });
  await audit(req.user.id, 'shortcut_updated', sc.id, { label: sc.label }, req);
  res.json({ shortcut: sc });
});

shortcutsRouter.post('/:id/click', async (req, res) => {
  const sc = await prisma.shortcut.update({
    where: { id: req.params.id },
    data: { clicks: { increment: 1 } },
  });
  res.json({ shortcut: sc });
});

shortcutsRouter.post('/reorder', async (req, res) => {
  const { ids } = req.body || {};
  if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids deve ser array' });
  await Promise.all(ids.map((id, idx) => prisma.shortcut.update({ where: { id }, data: { order: idx } })));
  res.json({ ok: true });
});

shortcutsRouter.delete('/:id', async (req, res) => {
  const sc = await prisma.shortcut.delete({ where: { id: req.params.id } });
  await audit(req.user.id, 'shortcut_deleted', sc.id, { label: sc.label }, req);
  res.json({ ok: true });
});
