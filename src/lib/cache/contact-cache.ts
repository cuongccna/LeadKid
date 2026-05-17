import { prisma } from '@/lib/db';

export interface ContactData {
  source: string;
  phones: string[];
  emails: string[];
  socialLinks: string[];
  zaloLinks: string[];
  facebookLinks: string[];
}

const CONTACT_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export async function getContactCache(normalizedDomain: string): Promise<ContactData | null> {
  const cached = await prisma.contactCache.findFirst({
    where: {
      normalizedDomain,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!cached) return null;

  return {
    source: cached.source,
    phones: cached.phones,
    emails: cached.emails,
    socialLinks: cached.socialLinks,
    zaloLinks: cached.zaloLinks,
    facebookLinks: cached.facebookLinks,
  };
}

export async function setContactCache(
  normalizedDomain: string,
  data: ContactData
): Promise<void> {
  const expiresAt = new Date(Date.now() + CONTACT_TTL_MS);

  await prisma.contactCache.create({
    data: {
      normalizedDomain,
      source: data.source,
      phones: data.phones,
      emails: data.emails,
      socialLinks: data.socialLinks,
      zaloLinks: data.zaloLinks,
      facebookLinks: data.facebookLinks,
      expiresAt,
    },
  });
}
