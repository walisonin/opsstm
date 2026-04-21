import { Router } from 'express';
import { prisma } from '../lib/db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { getIO } from '../lib/socket.js';

export const chatRouter = Router();
chatRouter.use(requireAuth);

const authorSelect = { id: true, name: true, handle: true, color: true };

chatRouter.get('/channels', async (req, res) => {
  const channels = await prisma.chatChannel.findMany({
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
    include: { _count: { select: { messages: true } } },
  });
  res.json({ channels: channels.map(c => ({ ...c, messageCount: c._count.messages })) });
});

chatRouter.post('/channels', requireAdmin, async (req, res) => {
  const { name, topic, type = 'text' } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name obrigatório' });
  const max = await prisma.chatChannel.aggregate({ _max: { order: true } });
  const ch = await prisma.chatChannel.create({
    data: {
      name: String(name).toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 40),
      topic: topic || null,
      type,
      order: (max._max.order ?? 0) + 1,
    },
  });
  res.json({ channel: ch });
});

chatRouter.get('/channels/:id/messages', async (req, res) => {
  const { before, limit = 50 } = req.query;
  const take = Math.min(Number(limit) || 50, 100);
  const messages = await prisma.chatMessage.findMany({
    where: {
      channelId: req.params.id,
      ...(before ? { createdAt: { lt: new Date(before) } } : {}),
    },
    take,
    orderBy: { createdAt: 'desc' },
    include: { author: { select: authorSelect } },
  });
  res.json({ messages: messages.reverse() });
});

chatRouter.post('/channels/:id/messages', async (req, res) => {
  const { body, replyToId, attachment } = req.body || {};
  if (!body && !attachment) return res.status(400).json({ error: 'body ou attachment obrigatório' });

  const channel = await prisma.chatChannel.findUnique({ where: { id: req.params.id } });
  if (!channel) return res.status(404).json({ error: 'Canal não encontrado' });
  if (channel.type === 'announce' && !['super_admin', 'admin'].includes(req.user.role))
    return res.status(403).json({ error: 'Apenas admins podem postar neste canal' });

  const msg = await prisma.chatMessage.create({
    data: {
      channelId: channel.id,
      authorId: req.user.id,
      body: body ? String(body).slice(0, 4000) : '',
      replyToId: replyToId || null,
      attachment: attachment || undefined,
    },
    include: { author: { select: authorSelect } },
  });

  getIO()?.to(`channel:${channel.id}`).emit('message:new', msg);
  res.json({ message: msg });
});

chatRouter.delete('/messages/:id', async (req, res) => {
  const msg = await prisma.chatMessage.findUnique({ where: { id: req.params.id } });
  if (!msg) return res.status(404).json({ error: 'Mensagem não encontrada' });
  const isMine = msg.authorId === req.user.id;
  const isMod = ['super_admin', 'admin', 'moderator'].includes(req.user.role);
  if (!isMine && !isMod) return res.status(403).json({ error: 'Sem permissão' });

  await prisma.chatMessage.delete({ where: { id: msg.id } });
  getIO()?.to(`channel:${msg.channelId}`).emit('message:deleted', { id: msg.id });
  res.json({ ok: true });
});

chatRouter.post('/messages/:id/react', async (req, res) => {
  const { emoji } = req.body || {};
  if (!emoji) return res.status(400).json({ error: 'emoji obrigatório' });
  const msg = await prisma.chatMessage.findUnique({ where: { id: req.params.id } });
  if (!msg) return res.status(404).json({ error: 'Mensagem não encontrada' });

  const reactions = { ...(msg.reactions || {}) };
  reactions[emoji] = (reactions[emoji] || 0) + 1;
  const updated = await prisma.chatMessage.update({ where: { id: msg.id }, data: { reactions } });
  getIO()?.to(`channel:${msg.channelId}`).emit('message:updated', updated);
  res.json({ message: updated });
});
