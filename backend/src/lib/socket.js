import { Server } from 'socket.io';
import { verifyToken } from './jwt.js';
import { prisma } from './db.js';

let io = null;
export const getIO = () => io;

const typing = new Map(); // channelId -> Map<userId, {user, timer}>

export function attachSocket(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: true, credentials: true },
    path: '/socket.io',
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token
      || socket.handshake.headers?.cookie?.match(/stm_token=([^;]+)/)?.[1];
    if (!token) return next(new Error('Auth required'));

    const decoded = verifyToken(token);
    if (!decoded?.sub) return next(new Error('Invalid token'));

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { id: true, name: true, handle: true, color: true, role: true, active: true },
    });
    if (!user || !user.active) return next(new Error('User not found'));

    socket.data.user = user;
    next();
  });

  io.on('connection', async (socket) => {
    const { user } = socket.data;
    await prisma.user.update({ where: { id: user.id }, data: { status: 'online', lastSeen: new Date() } }).catch(() => {});
    io.emit('presence:update', { userId: user.id, status: 'online' });

    socket.on('channel:join', (channelId) => {
      socket.join(`channel:${channelId}`);
    });
    socket.on('channel:leave', (channelId) => {
      socket.leave(`channel:${channelId}`);
    });

    socket.on('typing:start', ({ channelId }) => {
      if (!channelId) return;
      const room = typing.get(channelId) || new Map();
      const prev = room.get(user.id);
      if (prev?.timer) clearTimeout(prev.timer);
      const timer = setTimeout(() => {
        room.delete(user.id);
        io.to(`channel:${channelId}`).emit('typing:stop', { channelId, user });
      }, 3500);
      room.set(user.id, { user, timer });
      typing.set(channelId, room);
      socket.to(`channel:${channelId}`).emit('typing:start', { channelId, user });
    });

    socket.on('typing:stop', ({ channelId }) => {
      if (!channelId) return;
      const room = typing.get(channelId);
      if (room?.has(user.id)) {
        clearTimeout(room.get(user.id).timer);
        room.delete(user.id);
      }
      socket.to(`channel:${channelId}`).emit('typing:stop', { channelId, user });
    });

    socket.on('disconnect', async () => {
      try {
        // se não há outras conexões do mesmo usuário, marca offline
        const sockets = await io.fetchSockets();
        const stillOnline = sockets.some(s => s.data.user?.id === user.id);
        if (!stillOnline) {
          await prisma.user.update({ where: { id: user.id }, data: { status: 'offline' } }).catch(() => {});
          io.emit('presence:update', { userId: user.id, status: 'offline' });
        }
      } catch {}
    });
  });

  return io;
}
