import { prisma } from '@/lib/db';

const LOCK_TTL_MS = 5 * 60 * 1000; // 5 minutes
const POLL_INTERVAL_MS = 500; // 500ms

export async function acquireDomainLock(
  normalizedDomain: string,
  ownerJobId: string
): Promise<boolean> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + LOCK_TTL_MS);

  try {
    await prisma.domainLock.create({
      data: {
        normalizedDomain,
        status: 'processing',
        ownerJobId,
        lockedAt: now,
        expiresAt,
      },
    });
    return true;
  } catch {
    // Domain already locked
    return false;
  }
}

export async function releaseDomainLock(
  normalizedDomain: string,
  status: 'completed' | 'failed',
  errorMessage?: string
): Promise<void> {
  await prisma.domainLock.update({
    where: { normalizedDomain },
    data: {
      status,
      errorMessage: errorMessage || null,
    },
  });
}

export async function waitForCache<T>(
  checkFn: () => Promise<T | null>,
  timeoutMs = 60000
): Promise<T | null> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const result = await checkFn();
    if (result) return result;
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
  return null;
}
