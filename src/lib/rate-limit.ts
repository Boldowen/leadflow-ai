import "server-only";
import { db } from "./db";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Fixed-window limiter stored in Postgres, so it holds across serverless instances.
 * Returns false when `key` already has `limit` hits inside the window (the attempt is not counted).
 */
export async function rateLimit(key: string, limit: number, windowMs: number) {
  const since = new Date(Date.now() - windowMs);
  const hits = await db.rateLimitHit.count({ where: { key, createdAt: { gte: since } } });
  if (hits >= limit) return false;
  await db.rateLimitHit.create({ data: { key } });
  // Opportunistic cleanup instead of a cron job.
  if (Math.random() < 0.02) await db.rateLimitHit.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - DAY_MS) } } });
  return true;
}

/** Per-IP auth limits are configurable so the E2E suite (many sign-ups from one IP) can raise them. */
export const AUTH_IP_LIMIT = Number(process.env.AUTH_RATE_LIMIT_PER_IP ?? 30);
