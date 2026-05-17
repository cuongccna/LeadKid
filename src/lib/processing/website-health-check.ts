import { prisma } from '@/lib/db';

export type HealthStatus = 'healthy' | 'not_found' | 'timeout' | 'spam_suspected';

export interface HealthResult {
  status: HealthStatus;
  finalUrl?: string;
  statusCode?: number;
  loadTime?: number;
}

function getHealthTtl(status: HealthStatus): number {
  switch (status) {
    case 'healthy':
      return 14 * 24 * 60 * 60 * 1000; // 14 days
    case 'not_found':
    case 'spam_suspected':
      return 7 * 24 * 60 * 60 * 1000; // 7 days
    case 'timeout':
    default:
      return 1 * 24 * 60 * 60 * 1000; // 1 day
  }
}

export async function checkWebsiteHealth(url: string): Promise<HealthResult> {
  const domain = normalizeDomain(url);

  // Check cache first
  const cached = await prisma.websiteHealthCache.findUnique({
    where: { normalizedDomain: domain },
  });

  if (cached && cached.expiresAt > new Date()) {
    return {
      status: cached.status as HealthStatus,
      finalUrl: cached.finalUrl || undefined,
      statusCode: cached.statusCode || undefined,
    };
  }

  const result = await performCheck(url);
  const ttl = getHealthTtl(result.status);

  await prisma.websiteHealthCache.upsert({
    where: { normalizedDomain: domain },
    update: {
      status: result.status,
      finalUrl: result.finalUrl,
      statusCode: result.statusCode,
      checkedAt: new Date(),
      expiresAt: new Date(Date.now() + ttl),
    },
    create: {
      normalizedDomain: domain,
      status: result.status,
      finalUrl: result.finalUrl,
      statusCode: result.statusCode,
      expiresAt: new Date(Date.now() + ttl),
    },
  });

  return result;
}

async function performCheck(url: string): Promise<HealthResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  const startTime = Date.now();

  try {
    const res = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'LeadKit-HealthCheck/1.0',
      },
    });

    clearTimeout(timeout);
    const loadTime = Date.now() - startTime;

    if (res.status === 404) {
      return { status: 'not_found', finalUrl: res.url, statusCode: 404 };
    }

    if (!res.ok) {
      return { status: 'spam_suspected', finalUrl: res.url, statusCode: res.status };
    }

    return {
      status: loadTime > 3000 ? 'healthy' : 'healthy',
      finalUrl: res.url,
      statusCode: res.status,
      loadTime,
    };
  } catch (err: unknown) {
    clearTimeout(timeout);
    if (err instanceof Error && err.name === 'AbortError') {
      return { status: 'timeout' };
    }
    return { status: 'not_found' };
  }
}

function normalizeDomain(url: string): string {
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}
