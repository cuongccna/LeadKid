import { prisma } from './db';

// ─── Configuration ───
const GOSOM_RATE_LIMIT_MS = parseInt(process.env.GOSOM_RATE_LIMIT_MS || '10000', 10); // 10s between gosom queries
const USER_KIT_COOLDOWN_MS = parseInt(process.env.USER_KIT_COOLDOWN_MS || '30000', 10); // 30s between kit creation
const WORKER_POST_JOB_DELAY_MS = parseInt(process.env.WORKER_POST_JOB_DELAY_MS || '5000', 10); // 5s after each job

// ─── Global Gosom Rate Limiter (in-memory, per-process) ───
// If running multiple workers, each worker has its own instance,
// but since workers claim one job at a time, this still provides
// effective backpressure.
class GosomRateLimiter {
  private lastCallTime = 0;
  private minIntervalMs: number;

  constructor(minIntervalMs: number) {
    this.minIntervalMs = minIntervalMs;
  }

  async acquire(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastCallTime;
    const waitMs = this.minIntervalMs - elapsed;

    if (waitMs > 0) {
      console.log(`[RateLimit] Gosom call throttled: waiting ${waitMs}ms`);
      await sleep(waitMs);
    }

    this.lastCallTime = Date.now();
  }
}

export const gosomRateLimiter = new GosomRateLimiter(GOSOM_RATE_LIMIT_MS);

// ─── Per-User Kit Cooldown (PostgreSQL-backed) ───
export async function checkUserKitCooldown(userId: string): Promise<{
  allowed: boolean;
  remainingMs: number;
}> {
  const cutoff = new Date(Date.now() - USER_KIT_COOLDOWN_MS);

  const lastKit = await prisma.leadKit.findFirst({
    where: {
      userId,
      createdAt: { gt: cutoff },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!lastKit) {
    return { allowed: true, remainingMs: 0 };
  }

  const elapsed = Date.now() - lastKit.createdAt.getTime();
  const remainingMs = Math.max(0, USER_KIT_COOLDOWN_MS - elapsed);

  return {
    allowed: remainingMs <= 0,
    remainingMs,
  };
}

// ─── Worker Post-Job Delay ───
export async function workerPostJobDelay(): Promise<void> {
  if (WORKER_POST_JOB_DELAY_MS > 0) {
    console.log(`[RateLimit] Worker sleeping ${WORKER_POST_JOB_DELAY_MS}ms after job`);
    await sleep(WORKER_POST_JOB_DELAY_MS);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
