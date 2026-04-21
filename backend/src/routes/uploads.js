import express, { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { requireAuth } from '../middleware/auth.js';

const UPLOAD_DIR = process.env.UPLOAD_DIR || '/uploads';
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).slice(0, 10).replace(/[^a-zA-Z0-9.]/g, '');
    const id = crypto.randomBytes(16).toString('hex');
    cb(null, `${id}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
  fileFilter: (req, file, cb) => {
    const allowed = /\.(jpe?g|png|gif|webp|pdf|txt|md|docx?|xlsx?|pptx?|zip|csv|log)$/i;
    cb(null, allowed.test(file.originalname));
  },
});

export const uploadsRouter = Router();

uploadsRouter.post('/', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Arquivo inválido ou tipo não permitido' });
  res.json({
    file: {
      id: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mime: req.file.mimetype,
      url: `/api/uploads/${req.file.filename}`,
    },
  });
});

// Serve uploaded files as static assets with caching.
// Must come after the POST route so it doesn't swallow uploads.
uploadsRouter.use(express.static(UPLOAD_DIR, {
  maxAge: '7d',
  fallthrough: false,
  index: false,
  dotfiles: 'deny',
}));
