import { Router } from 'express';
import { prisma } from '../lib/db.js';
import { requireAuth, requireMod } from '../middleware/auth.js';
import { audit } from '../lib/audit.js';

export const forumRouter = Router();
forumRouter.use(requireAuth);

const authorSelect = { id: true, name: true, handle: true, color: true, title: true, role: true, avatar: true };

forumRouter.get('/categories', async (req, res) => {
  const categories = await prisma.forumCategory.findMany({
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
    include: { _count: { select: { topics: true } } },
  });

  const withMeta = await Promise.all(categories.map(async c => {
    const postCount = await prisma.forumPost.count({
      where: { topic: { categoryId: c.id } },
    });
    const lastTopic = await prisma.forumTopic.findFirst({
      where: { categoryId: c.id },
      orderBy: { updatedAt: 'desc' },
      include: {
        author: { select: authorSelect },
        posts: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { author: { select: authorSelect } },
        },
      },
    });
    return { ...c, topics: c._count.topics, posts: postCount, lastTopic };
  }));

  res.json({ categories: withMeta });
});

forumRouter.post('/categories', requireMod, async (req, res) => {
  const { name, description, icon = 'forum', color = '#9fb42c' } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name obrigatório' });
  const max = await prisma.forumCategory.aggregate({ _max: { order: true } });
  const cat = await prisma.forumCategory.create({
    data: { name, description, icon, color, order: (max._max.order ?? 0) + 1 },
  });
  res.json({ category: cat });
});

forumRouter.get('/topics', async (req, res) => {
  const { categoryId, limit = 50, hot } = req.query;
  const where = {};
  if (categoryId) where.categoryId = String(categoryId);
  if (hot === 'true') where.hot = true;

  const topics = await prisma.forumTopic.findMany({
    where,
    take: Math.min(Number(limit) || 50, 100),
    include: {
      author: { select: authorSelect },
      category: true,
      _count: { select: { posts: true } },
      posts: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: { author: { select: authorSelect } },
      },
    },
    orderBy: [{ pinned: 'desc' }, { updatedAt: 'desc' }],
  });

  res.json({
    topics: topics.map(t => ({
      ...t,
      replies: Math.max(0, t._count.posts - 1),
      lastPost: t.posts[0] || null,
    })),
  });
});

forumRouter.get('/topics/:id', async (req, res) => {
  const topic = await prisma.forumTopic.findUnique({
    where: { id: req.params.id },
    include: {
      author: { select: authorSelect },
      category: true,
    },
  });
  if (!topic) return res.status(404).json({ error: 'Tópico não encontrado' });

  await prisma.forumTopic.update({ where: { id: topic.id }, data: { views: { increment: 1 } } });

  const posts = await prisma.forumPost.findMany({
    where: { topicId: topic.id },
    include: { author: { select: authorSelect } },
    orderBy: { createdAt: 'asc' },
  });

  res.json({ topic, posts });
});

forumRouter.post('/topics', async (req, res) => {
  const { categoryId, title, body, tags = [] } = req.body || {};
  if (!categoryId || !title || !body) return res.status(400).json({ error: 'Campos obrigatórios' });

  const topic = await prisma.forumTopic.create({
    data: {
      categoryId,
      title: String(title).slice(0, 160),
      authorId: req.user.id,
      tags: Array.isArray(tags) ? tags.slice(0, 8) : [],
      posts: { create: { authorId: req.user.id, body: String(body).slice(0, 20000) } },
    },
    include: { author: { select: authorSelect } },
  });
  await prisma.user.update({ where: { id: req.user.id }, data: { postCount: { increment: 1 } } });
  await audit(req.user.id, 'topic_created', topic.id, { title }, req);
  res.json({ topic });
});

forumRouter.post('/topics/:id/posts', async (req, res) => {
  const topic = await prisma.forumTopic.findUnique({ where: { id: req.params.id } });
  if (!topic) return res.status(404).json({ error: 'Tópico não encontrado' });
  if (topic.locked && !['super_admin', 'admin', 'moderator'].includes(req.user.role))
    return res.status(403).json({ error: 'Tópico fechado' });

  const { body } = req.body || {};
  if (!body) return res.status(400).json({ error: 'body obrigatório' });

  const post = await prisma.forumPost.create({
    data: { topicId: topic.id, authorId: req.user.id, body: String(body).slice(0, 20000) },
    include: { author: { select: authorSelect } },
  });
  await prisma.forumTopic.update({ where: { id: topic.id }, data: { updatedAt: new Date() } });
  await prisma.user.update({
    where: { id: req.user.id },
    data: { postCount: { increment: 1 }, reputation: { increment: 2 } },
  });
  res.json({ post });
});

forumRouter.patch('/topics/:id', requireMod, async (req, res) => {
  const { pinned, locked, hot, title } = req.body || {};
  const data = {};
  if (pinned !== undefined) data.pinned = !!pinned;
  if (locked !== undefined) data.locked = !!locked;
  if (hot !== undefined) data.hot = !!hot;
  if (title !== undefined) data.title = String(title).slice(0, 160);

  const topic = await prisma.forumTopic.update({ where: { id: req.params.id }, data });
  await audit(req.user.id, 'topic_moderated', topic.id, data, req);
  res.json({ topic });
});

forumRouter.post('/posts/:id/react', async (req, res) => {
  const { emoji } = req.body || {};
  if (!emoji) return res.status(400).json({ error: 'emoji obrigatório' });
  const post = await prisma.forumPost.findUnique({ where: { id: req.params.id } });
  if (!post) return res.status(404).json({ error: 'Post não encontrado' });

  const reactions = { ...(post.reactions || {}) };
  reactions[emoji] = (reactions[emoji] || 0) + 1;
  const updated = await prisma.forumPost.update({ where: { id: post.id }, data: { reactions } });
  res.json({ post: updated });
});

forumRouter.delete('/posts/:id', requireMod, async (req, res) => {
  await prisma.forumPost.delete({ where: { id: req.params.id } });
  await audit(req.user.id, 'post_deleted', req.params.id, null, req);
  res.json({ ok: true });
});

forumRouter.delete('/topics/:id', requireMod, async (req, res) => {
  await prisma.forumTopic.delete({ where: { id: req.params.id } });
  await audit(req.user.id, 'topic_deleted', req.params.id, null, req);
  res.json({ ok: true });
});
