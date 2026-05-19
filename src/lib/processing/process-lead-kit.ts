import { prisma } from '@/lib/db';
import { MockPlacesProvider } from '@/lib/providers/places/mock-places-provider';
import { GooglePlacesProvider } from '@/lib/providers/places/google-places-provider';
import { GosomPlacesProvider } from '@/lib/providers/places/gosom-places-provider';
import { CompositePlacesProvider } from '@/lib/providers/places/composite-places-provider';
import type { PlaceResult } from '@/lib/providers/places/provider';
import { detectPainSignals, detectReviewPainSignals } from './pain-detector';
import { checkWebsiteHealth } from './website-health-check';
import { extractPhones, extractEmails, extractSocialLinks, normalizeVietnamPhone } from './contact-extractor';
import { getAIProvider } from '@/lib/ai';
import { detectIntent, calculateLeadScore } from '@/lib/intent';
import { Prisma } from '@prisma/client';
import { acquireDomainLock, releaseDomainLock, waitForCache } from '@/lib/cache/domain-lock';
import { getScrapeCache, setScrapeCache, type ScrapeData } from '@/lib/cache/scrape-cache';
import { getContactCache, setContactCache, type ContactData } from '@/lib/cache/contact-cache';
import { gosomRateLimiter } from '@/lib/ratelimit';

function getPlacesProvider() {
  const gosomUrl = process.env.GOSOM_API_URL || 'http://localhost:8080';
  const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;

  const providers = [];

  // 1. Gosom làm primary scraper
  providers.push(new GosomPlacesProvider(gosomUrl));

  // 2. Google Places API làm fallback
  if (googleApiKey && googleApiKey !== 'your_google_places_api_key') {
    providers.push(new GooglePlacesProvider(googleApiKey));
  }

  // 3. Mock làm fallback cuối cùng cho dev
  providers.push(new MockPlacesProvider());

  return new CompositePlacesProvider(providers);
}

function normalizeDomain(url: string): string {
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

const PLACE_CACHE_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

async function fetchWithTimeout(url: string, timeoutMs = 5000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'LeadKit-Bot/1.0' },
    });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

async function scrapeWithCache(
  websiteUri: string,
  jobId: string
): Promise<{ html: string | null; scrapeCacheId: string | null }> {
  const domain = normalizeDomain(websiteUri);

  // 1. Check scrape cache
  const cached = await getScrapeCache(domain);
  if (cached && cached.html) {
    return { html: cached.html, scrapeCacheId: null };
  }

  // 2. Acquire domain lock
  const locked = await acquireDomainLock(domain, jobId);

  if (!locked) {
    // Another job is scraping this domain; wait for cache
    const polled = await waitForCache(async () => {
      const c = await getScrapeCache(domain);
      return c?.html ?? null;
    }, 60000);
    return { html: polled, scrapeCacheId: null };
  }

  try {
    // 3. Double-check cache after acquiring lock
    const doubleCheck = await getScrapeCache(domain);
    if (doubleCheck && doubleCheck.html) {
      return { html: doubleCheck.html, scrapeCacheId: null };
    }

    // 4. Perform scrape
    let html: string | null = null;
    let status: ScrapeData['status'] = 'failed';
    let errorMessage: string | undefined;
    let finalUrl: string | undefined;

    try {
      const res = await fetchWithTimeout(websiteUri, 8000);
      finalUrl = res.url;
      if (res.ok) {
        html = await res.text();
        status = 'success';
      } else if (res.status === 403 || res.status === 429) {
        status = 'blocked';
        errorMessage = `HTTP ${res.status}`;
      } else {
        status = 'failed';
        errorMessage = `HTTP ${res.status}`;
      }
    } catch (err) {
      status = 'failed';
      errorMessage = err instanceof Error ? err.message : 'Unknown error';
    }

    // 5. Save to scrape cache
    await setScrapeCache(domain, websiteUri, {
      status,
      finalUrl,
      html: html || undefined,
      errorMessage,
    });

    // 6. Release lock
    await releaseDomainLock(domain, status === 'success' ? 'completed' : 'failed', errorMessage);

    return { html, scrapeCacheId: null };
  } catch (err) {
    await releaseDomainLock(
      domain,
      'failed',
      err instanceof Error ? err.message : 'Unknown error'
    );
    return { html: null, scrapeCacheId: null };
  }
}

async function extractContactsWithCache(
  html: string,
  websiteUri: string
): Promise<{ contact: ContactData; contactCacheId: string | null }> {
  const domain = normalizeDomain(websiteUri);

  // 1. Check contact cache
  const cached = await getContactCache(domain);
  if (cached) {
    return { contact: cached, contactCacheId: null };
  }

  // 2. Extract contacts
  const phones = extractPhones(html);
  const emails = extractEmails(html);
  const social = extractSocialLinks(html);

  const zaloLinks = social.zalo ? [social.zalo] : [];
  const facebookLinks = social.facebook ? [social.facebook] : [];
  const socialLinks = [...zaloLinks, ...facebookLinks];

  const contact: ContactData = {
    source: websiteUri,
    phones,
    emails,
    socialLinks,
    zaloLinks,
    facebookLinks,
  };

  // 3. Save to contact cache
  await setContactCache(domain, contact);

  return { contact, contactCacheId: null };
}

export async function processLeadKit(jobId: string, leadKitId: string) {
  const kit = await prisma.leadKit.findUnique({
    where: { id: leadKitId },
  });

  if (!kit) throw new Error('LeadKit not found');

  const user = await prisma.user.findUnique({ where: { id: kit.userId } });
  const isPro = user?.role === 'pro' || user?.role === 'agency';
  const aiProvider = getAIProvider(isPro);

  await prisma.job.update({
    where: { id: jobId },
    data: {
      status: 'running',
      currentStep: 'Đang tìm kiếm doanh nghiệp...',
      progressTotal: kit.leadCount,
      startedAt: new Date(),
    },
  });

  // --- Place Cache-First Search ---
  const provider = getPlacesProvider();
  const query = `${kit.targetIndustry} ${kit.targetLocation}`;

  // Try to get cached places first
  const cachedPlaces = await prisma.placeCache.findMany({
    where: {
      expiresAt: { gt: new Date() },
      OR: [
        { displayName: { contains: kit.targetIndustry, mode: 'insensitive' } },
        { formattedAddress: { contains: kit.targetLocation, mode: 'insensitive' } },
        { types: { has: kit.targetIndustry.toLowerCase() } },
      ],
    },
    take: kit.leadCount,
    orderBy: { lastSeenAt: 'desc' },
  });

  let places: Array<PlaceResult & { provider?: string }> = cachedPlaces.map((p) => ({
    placeId: p.placeId,
    displayName: p.displayName || '',
    formattedAddress: p.formattedAddress || undefined,
    phone: p.phone || undefined,
    nationalPhoneNumber: p.nationalPhoneNumber || undefined,
    internationalPhoneNumber: p.internationalPhoneNumber || undefined,
    websiteUri: p.websiteUri || undefined,
    googleMapsUri: p.googleMapsUri || undefined,
    rating: p.rating ? Number(p.rating) : undefined,
    userRatingCount: p.userRatingCount || undefined,
    reviewsLink: p.reviewsLink || undefined,
    reviewsPerRating: (p.reviewsPerRating as Record<string, number>) || undefined,
    latitude: p.latitude ? Number(p.latitude) : undefined,
    longitude: p.longitude ? Number(p.longitude) : undefined,
    businessStatus: p.businessStatus || undefined,
    types: p.types || undefined,
    provider: p.provider || undefined,
  }));

  // If not enough cached places, fetch from provider
  if (places.length < kit.leadCount) {
    await gosomRateLimiter.acquire();
    const fresh = await provider.search({ query, maxResults: kit.leadCount });

    // Merge fresh results, avoiding duplicates by placeId
    const existingIds = new Set(places.map((p) => p.placeId));
    for (const p of fresh) {
      if (!existingIds.has(p.placeId)) {
        places.push(p);
        existingIds.add(p.placeId);
      }
    }
  }

  // Fill by cycling if still not enough
  if (places.length < kit.leadCount) {
    const original = [...places];
    while (places.length < kit.leadCount && original.length > 0) {
      const idx = places.length % original.length;
      const base = original[idx];
      places.push({
        ...base,
        placeId: `${base.placeId}_dup_${places.length}`,
        displayName: `${base.displayName} ${places.length + 1}`,
      });
    }
  }

  // Limit to requested count
  places = places.slice(0, kit.leadCount);

  await prisma.job.update({
    where: { id: jobId },
    data: {
      currentStep: 'Đang phân tích website...',
      progressCurrent: 0,
    },
  });

  // Process each place
  for (let i = 0; i < places.length; i++) {
    const place = places[i];
    let html: string | null = null;
    let loadTime: number | undefined;
    let scrapeCacheId: string | null = null;
    let contactCacheId: string | null = null;
    let extraPhone: string | undefined;

    // --- Website Health Check (cache-first) ---
    if (place.websiteUri) {
      try {
        const health = await checkWebsiteHealth(place.websiteUri);
        loadTime = health.loadTime;

        if (health.status === 'healthy') {
          // --- Scrape with cache + domain lock ---
          const scrapeResult = await scrapeWithCache(place.websiteUri, jobId);
          html = scrapeResult.html;
          scrapeCacheId = scrapeResult.scrapeCacheId;

          // --- Contact Extraction with cache ---
          if (html) {
            const contactResult = await extractContactsWithCache(html, place.websiteUri);
            contactCacheId = contactResult.contactCacheId;

            if (contactResult.contact.phones.length > 0 && !place.phone) {
              extraPhone = contactResult.contact.phones[0];
            }
          }
        }
      } catch {
        // Ignore health check errors
      }
    }

    // --- Intent Detection ---
    let intentResult = { signals: [] as Array<{ type: string; label: string; confidence?: number }>, summary: '', score: 0 };
    try {
      intentResult = await detectIntent({
        companyName: place.displayName,
        websiteUrl: place.websiteUri,
        html,
        rating: place.rating,
        userRatingCount: place.userRatingCount,
      });
    } catch {
      // Ignore intent detection errors
    }

    // --- Pain Detection ---
    const pain = detectPainSignals({
      websiteUri: place.websiteUri,
      html,
      loadTime,
    });

    // --- Review-based Pain Detection ---
    const reviewPain = detectReviewPainSignals(
      place.reviewsPerRating,
      place.userRatingCount,
      place.rating
    );

    // Combine pain summaries
    let combinedPainSummary = pain.summary;
    if (reviewPain) {
      combinedPainSummary = reviewPain.summary;
    }

    // --- Lead Scoring ---
    const social = html ? extractSocialLinks(html) : { zalo: null, facebook: null };
    const scoreResult = calculateLeadScore({
      intentSignals: intentResult.signals,
      hasPhone: !!(place.phone || extraPhone),
      hasZalo: !!social.zalo,
      hasFacebook: !!social.facebook,
      hasEmail: html ? extractEmails(html).length > 0 : false,
      painSignals: pain.signals,
      leadAgeDays: 0, // Fresh lead
    });

    // --- Generate AI Script (with intent context) ---
    let scriptText: string | null = null;
    try {
      scriptText = await aiProvider.generateScript({
        companyName: place.displayName,
        painSummary: combinedPainSummary,
        serviceName: kit.serviceName,
        industry: kit.targetIndustry,
        reviewInsight: reviewPain?.pitchAngle || null,
        rating: place.rating,
        userRatingCount: place.userRatingCount,
        intentSignals: intentResult.signals,
        intentSummary: intentResult.summary,
      });
    } catch {
      scriptText = `Chào anh/chị ${place.displayName}, em có gợi ý nhỏ giúp tiệm kinh doanh tốt hơn ạ.`;
    }

    // --- Cache Place ---
    const expiresAt = new Date(Date.now() + PLACE_CACHE_TTL_MS);
    await prisma.placeCache.upsert({
      where: { placeId: place.placeId },
      update: {
        provider: place.provider || 'unknown',
        displayName: place.displayName,
        formattedAddress: place.formattedAddress,
        phone: place.phone || extraPhone || normalizeVietnamPhone(place.nationalPhoneNumber || '') || normalizeVietnamPhone(place.internationalPhoneNumber || ''),
        nationalPhoneNumber: place.nationalPhoneNumber,
        internationalPhoneNumber: place.internationalPhoneNumber,
        websiteUri: place.websiteUri,
        googleMapsUri: place.googleMapsUri,
        latitude: place.latitude ? String(place.latitude) : null,
        longitude: place.longitude ? String(place.longitude) : null,
        businessStatus: place.businessStatus,
        types: place.types || [],
        rating: place.rating ? String(place.rating) : null,
        userRatingCount: place.userRatingCount,
        reviewsLink: place.reviewsLink,
        reviewsPerRating: place.reviewsPerRating as Prisma.InputJsonValue,
        lastSeenAt: new Date(),
        expiresAt,
      },
      create: {
        placeId: place.placeId,
        provider: place.provider || 'unknown',
        displayName: place.displayName,
        formattedAddress: place.formattedAddress,
        phone: place.phone || extraPhone || normalizeVietnamPhone(place.nationalPhoneNumber || '') || normalizeVietnamPhone(place.internationalPhoneNumber || ''),
        nationalPhoneNumber: place.nationalPhoneNumber,
        internationalPhoneNumber: place.internationalPhoneNumber,
        websiteUri: place.websiteUri,
        googleMapsUri: place.googleMapsUri,
        latitude: place.latitude ? String(place.latitude) : null,
        longitude: place.longitude ? String(place.longitude) : null,
        businessStatus: place.businessStatus,
        types: place.types || [],
        rating: place.rating ? String(place.rating) : null,
        userRatingCount: place.userRatingCount,
        reviewsLink: place.reviewsLink,
        reviewsPerRating: place.reviewsPerRating as Prisma.InputJsonValue,
        rawData: place as unknown as Prisma.InputJsonValue,
        firstSeenAt: new Date(),
        lastSeenAt: new Date(),
        expiresAt,
      }
    });

    // --- Create Lead ---
    await prisma.lead.create({
      data: {
        leadKitId: kit.id,
        userId: kit.userId,
        placeId: place.placeId,
        companyName: place.displayName,
        formattedAddress: place.formattedAddress,
        phone: place.phone || extraPhone || normalizeVietnamPhone(place.nationalPhoneNumber || '') || normalizeVietnamPhone(place.internationalPhoneNumber || ''),
        nationalPhoneNumber: place.nationalPhoneNumber,
        internationalPhoneNumber: place.internationalPhoneNumber,
        websiteUrl: place.websiteUri,
        googleMapsUri: place.googleMapsUri,
        businessStatus: place.businessStatus,
        types: place.types || [],
        rating: place.rating ? String(place.rating) : null,
        userRatingCount: place.userRatingCount,
        reviewsLink: place.reviewsLink,
        reviewsPerRating: place.reviewsPerRating as Prisma.InputJsonValue,
        placeProvider: place.provider || 'unknown',
        painSignals: pain.signals,
        painSummary: pain.summary,
        scriptText,
        isFreePreview: i < 1,
        scrapeCacheId,
        contactCacheId,
        intentSignals: intentResult.signals,
        intentSummary: intentResult.summary,
        leadScore: scoreResult.score,
        leadScoreLabel: scoreResult.label,
      },
    });

    // Update progress
    await prisma.job.update({
      where: { id: jobId },
      data: {
        progressCurrent: i + 1,
        currentStep: `Đang phân tích ${place.displayName}...`,
      },
    });
  }

  // Update kit summary
  const allLeads = await prisma.lead.findMany({
    where: { leadKitId: kit.id },
  });

  const painSignalCounts: Record<string, number> = {};
  allLeads.forEach((lead) => {
    (lead.painSignals as string[]).forEach((signal) => {
      painSignalCounts[signal] = (painSignalCounts[signal] || 0) + 1;
    });
  });

  await prisma.leadKit.update({
    where: { id: leadKitId },
    data: {
      status: 'completed',
      totalLeads: allLeads.length,
      totalMobilePhones: allLeads.filter((l) => l.phone).length,
      totalEmails: allLeads.filter((l) => l.phone || l.nationalPhoneNumber || l.internationalPhoneNumber).length,
      painSignalsSummary: Object.entries(painSignalCounts).map(([signal, count]) => ({
        signal,
        count,
      })),
    },
  });

  await prisma.job.update({
    where: { id: jobId },
    data: {
      status: 'completed',
      progressCurrent: allLeads.length,
      currentStep: 'Hoàn thành',
      completedAt: new Date(),
      result: { totalLeads: allLeads.length },
    },
  });
}
