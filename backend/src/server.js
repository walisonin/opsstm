import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import http from 'http';
import { attachSocket } from './lib/socket.js';
import { authRouter } from './routes/auth.js';
import { usersRouter } from './routes/users.js';
import { shortcutsRouter } from './routes/shortcuts.js';
import { vaultRouter } from './routes/vault.js';
import { forumRouter } from './routes/forum.js';
import { chatRouter } from './routes/chat.js';
import { announcementsRouter } from './routes/announcements.js';
import { adminRouter } from './routes/admin.js';
import { uploadsRouter } from './routes/uploads.js';
import { seedIfEmpty } from './seed.js';

const app = express();
const server = http.createServer(app);

app.set('trust proxy', 1);
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/shortcuts', shortcutsRouter);
app.use('/api/vault', vaultRouter);
app.use('/api/forum', forumRouter);
app.use('/api/chat', chatRouter);
app.use('/api/announcements', announcementsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/uploads', uploadsRouter);

app.use((err, req, res, next) => {
  console.error('[error]', err);
  res.status(err.status || 500).json({ error: err.message || 'Erro interno' });
});

attachSocket(server);

const PORT = Number(process.env.PORT || 4000);

(async () => {
  try {
    await seedIfEmpty();
  } catch (e) {
    console.error('[seed] falhou:', e);
  }
  server.listen(PORT, () => {
    console.log(`➤ STM Backend rodando em http://0.0.0.0:${PORT}`);
  });
})();
