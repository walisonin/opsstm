import { Router } from 'express';
import { prisma } from '../lib/db.js';
import { requireAuth } from '../middleware/auth.js';
import { encrypt, decrypt } from '../lib/crypto.js';
import { audit } from '../lib/audit.js';

export const vaultRouter = Router();
vaultRouter.use(requireAuth);

vaultRouter.get('/categories', async (req, res) => {
  const categories = await prisma.vaultCategory.findMany({
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
    include: { _count: { select: { items: true } } },
  });
  res.json({ categories });
});

vaultRouter.post('/categories', async (req, res) => {
  const { name, icon = 'box', color = '#9fb42c' } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name obrigatório' });
  const max = await prisma.vaultCategory.aggregate({ _max: { order: true } });
  const cat = await prisma.vaultCategory.create({
    data: { name, icon, color, order: (max._max.order ?? 0) + 1 },
  });
  res.json({ category: cat });
});

vaultRouter.get('/', async (req, res) => {
  const { categoryId, q } = req.query;
  const where = {};
  if (categoryId && categoryId !== 'all') where.categoryId = String(categoryId);
  const items = await prisma.vaultItem.findMany({
    where,
    include: {
      updatedBy: { select: { id: true, name: true, handle: true, color: true, avatar: true } },
      category: true,
    },
    orderBy: { updatedAt: 'desc' },
  });
  const list = items.map(i => ({ ...i, passwordEnc: undefined, hasPassword: !!i.passwordEnc }));
  if (q) {
    const needle = String(q).toLowerCase();
    return res.json({ items: list.filter(i =>
      i.name.toLowerCase().includes(needle) ||
      i.url.toLowerCase().includes(needle) ||
      (i.tags || []).some(t => t.toLowerCase().includes(needle))
    )});
  }
  res.json({ items: list });
});

vaultRouter.post('/', async (req, res) => {
  const { categoryId, name, url, username, password, tags = [], notes } = req.body || {};
  if (!categoryId || !name || !url) return res.status(400).json({ error: 'Campos obrigatórios: categoryId, name, url' });

  const item = await prisma.vaultItem.create({
    data: {
      categoryId, name, url,
      username: username || null,
      passwordEnc: password ? encrypt(password) : '',
      tags: Array.isArray(tags) ? tags.slice(0, 10) : [],
      notes: notes || null,
      updatedById: req.user.id,
    },
    include: {
      updatedBy: { select: { id: true, name: true, handle: true, color: true, avatar: true } },
      category: true,
    },
  });
  await audit(req.user.id, 'vault_created', item.id, { name }, req);
  const { passwordEnc, ...safe } = item;
  res.json({ item: { ...safe, hasPassword: !!passwordEnc } });
});

vaultRouter.patch('/:id', async (req, res) => {
  const existing = await prisma.vaultItem.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: 'Item não encontrado' });

  const { categoryId, name, url, username, password, tags, notes } = req.body || {};
  const data = { updatedById: req.user.id };
  if (categoryId !== undefined) data.categoryId = categoryId;
  if (name !== undefined) data.name = name;
  if (url !== undefined) data.url = url;
  if (username !== undefined) data.username = username;
  if (password !== undefined && password) data.passwordEnc = encrypt(password);
  if (Array.isArray(tags)) data.tags = tags.slice(0, 10);
  if (notes !== undefined) data.notes = notes;

  const item = await prisma.vaultItem.update({
    where: { id: req.params.id },
    data,
    include: {
      updatedBy: { select: { id: true, name: true, handle: true, color: true, avatar: true } },
      category: true,
    },
  });
  await audit(req.user.id, 'vault_updated', item.id, { name: item.name }, req);
  const { passwordEnc, ...safe } = item;
  res.json({ item: { ...safe, hasPassword: !!passwordEnc } });
});

vaultRouter.get('/:id/reveal', async (req, res) => {
  const item = await prisma.vaultItem.findUnique({ where: { id: req.params.id } });
  if (!item) return res.status(404).json({ error: 'Item não encontrado' });
  const password = decrypt(item.passwordEnc);
  await audit(req.user.id, 'vault_revealed', item.id, { name: item.name }, req);
  res.json({ password: password || '' });
});

vaultRouter.delete('/:id', async (req, res) => {
  const item = await prisma.vaultItem.delete({ where: { id: req.params.id } });
  await audit(req.user.id, 'vault_deleted', item.id, { name: item.name }, req);
  res.json({ ok: true });
});
