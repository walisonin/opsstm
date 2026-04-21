import { prisma } from './db.js';

export async function audit(userId, action, target, meta, req) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        target: target ? String(target) : null,
        meta: meta ?? undefined,
        ip: req?.ip || req?.headers?.['x-forwarded-for'] || null,
      },
    });
  } catch (e) {
    console.error('audit error', e);
  }
}
