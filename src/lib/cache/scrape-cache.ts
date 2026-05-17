import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

export interface ScrapeData {
  status: 'success' | 'failed' | 'blocked';
  title?: string;
  finalUrl?: string;
  markdown?: string;
  html?: string;
  links?: string[];
  metadata?: Record<string, unknown>;
  errorMessage?: string;
}

const SCRAPE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export async function getScrapeCache(normalizedDomain: string): Promise<ScrapeData | null> {
  const cached = await prisma.scrapeCache.findFirst({
    where: {
      normalizedDomain,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!cached) return null;

  return {
    status: cached.status as ScrapeData['status'],
    title: cached.title || undefined,
    finalUrl: cached.finalUrl || undefined,
    markdown: cached.markdown || undefined,
    html: cached.html || undefined,
    links: cached.links,
    metadata: (cached.metadata as Record<string, unknown>) || undefined,
    errorMessage: cached.errorMessage || undefined,
  };
}

export async function setScrapeCache(
  normalizedDomain: string,
  url: string,
  data: ScrapeData
): Promise<void> {
  const expiresAt = new Date(Date.now() + SCRAPE_TTL_MS);

  await prisma.scrapeCache.create({
    data: {
      normalizedDomain,
      url,
      status: data.status,
      title: data.title || null,
      finalUrl: data.finalUrl || null,
      markdown: data.markdown || null,
      html: data.html || null,
      links: data.links || [],
      metadata: (data.metadata || null) as Prisma.InputJsonValue,
      errorMessage: data.errorMessage || null,
      expiresAt,
    },
  });
}
