import { PlacesProvider, PlaceResult } from './provider';

interface GosomJobResponse {
  id?: string;
  ID?: string;
}

interface GosomJobStatus {
  // Gosom API returns PascalCase fields for status endpoint
  ID?: string;
  Name?: string;
  Date?: string;
  Status?: string;
  Data?: {
    keywords?: string[];
    lang?: string;
    zoom?: number;
    lat?: string;
    lon?: string;
    fast_mode?: boolean;
    radius?: number;
    depth?: number;
    email?: boolean;
    max_time?: number;
    proxies?: string[];
  };
  // Keep lowercase for safety (some endpoints might return lowercase)
  id?: string;
  name?: string;
  date?: string;
  status?: string;
  data?: {
    keywords?: string[];
    lang?: string;
    zoom?: number;
    lat?: string;
    lon?: string;
    fast_mode?: boolean;
    radius?: number;
    depth?: number;
    email?: boolean;
    max_time?: number;
    proxies?: string[];
  };
}

function getJobId(createData: GosomJobResponse): string | undefined {
  return createData.id || createData.ID;
}

function getJobStatus(jobStatus: GosomJobStatus | null | undefined): string | undefined {
  if (!jobStatus) return undefined;
  return jobStatus.status || jobStatus.Status;
}

function parseGosomCsv(csvText: string): PlaceResult[] {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];

  const headerLine = lines[0];
  const headers = parseCsvLine(headerLine);

  const results: PlaceResult[] = [];
  for (let i = 1; i < lines.length; i++) {
    const row = parseCsvLine(lines[i]);
    if (row.length === 0) continue;

    const get = (name: string): string | undefined => {
      const idx = headers.findIndex((h) => h.toLowerCase().trim() === name.toLowerCase());
      return idx >= 0 ? row[idx] : undefined;
    };

    const title = get('title');
    if (!title) continue;

    const placeId = get('place_id') || get('data_id') || `gosom_${i}`;
    const phone = get('phone');
    const website = get('website');
    const link = get('link');
    const address = get('complete_address') || get('address');
    const ratingStr = get('review_rating');
    const reviewCountStr = get('review_count');
    const reviewsLinkStr = get('reviews_link');
    const reviewsPerRatingStr = get('reviews_per_rating');
    const latStr = get('latitude');
    const lonStr = get('longitude');
    const status = get('status');

    let reviewsPerRating: Record<string, number> | undefined;
    if (reviewsPerRatingStr) {
      try {
        const parsed = JSON.parse(reviewsPerRatingStr);
        if (typeof parsed === 'object' && parsed !== null) {
          reviewsPerRating = parsed;
        }
      } catch {
        // Ignore parse errors
      }
    }

    results.push({
      placeId,
      displayName: title,
      formattedAddress: address,
      phone,
      nationalPhoneNumber: phone,
      websiteUri: website,
      googleMapsUri: link,
      rating: ratingStr ? parseFloat(ratingStr) : undefined,
      userRatingCount: reviewCountStr ? parseInt(reviewCountStr, 10) : undefined,
      reviewsLink: reviewsLinkStr,
      reviewsPerRating,
      latitude: latStr ? parseFloat(latStr) : undefined,
      longitude: lonStr ? parseFloat(lonStr) : undefined,
      businessStatus: status,
      provider: 'gosom',
    });
  }

  return results;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export class GosomPlacesProvider implements PlacesProvider {
  private baseUrl: string;
  private pollIntervalMs: number;
  private maxWaitMs: number;
  private depth: number;
  private extractEmails: boolean;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.pollIntervalMs = parseInt(process.env.GOSOM_POLL_INTERVAL_MS || '5000', 10);
    this.maxWaitMs = parseInt(process.env.GOSOM_MAX_WAIT_MS || '600000', 10);
    this.depth = parseInt(process.env.GOSOM_DEPTH || '1', 10);
    this.extractEmails = process.env.GOSOM_EMAIL === 'true';
  }

  async search({ query, maxResults }: { query: string; maxResults: number }): Promise<PlaceResult[]> {
    // 1. Create job
    const createRes = await fetch(`${this.baseUrl}/api/v1/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `LeadKit: ${query}`,
        keywords: [query],
        lang: 'vi',
        depth: this.depth,
        email: this.extractEmails,
        max_time: Math.min(600, Math.ceil(this.maxWaitMs / 1000)),
      }),
    });

    if (!createRes.ok) {
      const text = await createRes.text().catch(() => 'unknown');
      throw new Error(`Gosom create job failed: ${createRes.status} ${text}`);
    }

    const createData = (await createRes.json()) as GosomJobResponse;
    const jobId = getJobId(createData);
    if (!jobId) {
      throw new Error('Gosom create job returned no id');
    }

    console.log(`[Gosom] Job created: ${jobId} for query: ${query}`);

    // 2. Poll until completed or failed
    const startTime = Date.now();
    let jobStatus: GosomJobStatus | null = null;
    let lastStatus: string | undefined;

    while (Date.now() - startTime < this.maxWaitMs) {
      const statusRes = await fetch(`${this.baseUrl}/api/v1/jobs/${jobId}`);
      if (!statusRes.ok) {
        const text = await statusRes.text().catch(() => 'unknown');
        throw new Error(`Gosom poll job failed: ${statusRes.status} ${text}`);
      }

      jobStatus = (await statusRes.json()) as GosomJobStatus;
      const currentStatus = getJobStatus(jobStatus);

      if (currentStatus !== lastStatus) {
        console.log(`[Gosom] Job ${jobId} status: ${currentStatus}`);
        lastStatus = currentStatus;
      }

      // Gosom API returns 'ok' when job is completed successfully
      if (currentStatus === 'ok' || currentStatus === 'completed') {
        break;
      }
      if (currentStatus === 'failed' || currentStatus === 'error') {
        throw new Error(`Gosom job ${jobId} failed with status: ${currentStatus}`);
      }

      await sleep(this.pollIntervalMs);
    }

    const finalStatus = getJobStatus(jobStatus);
    if (!jobStatus || (finalStatus !== 'ok' && finalStatus !== 'completed')) {
      throw new Error(`Gosom job ${jobId} timed out after ${this.maxWaitMs}ms. Last status: ${finalStatus}`);
    }

    console.log(`[Gosom] Job ${jobId} finished with status: ${finalStatus}`);

    // 3. Download CSV results
    const downloadRes = await fetch(`${this.baseUrl}/api/v1/jobs/${jobId}/download`);
    if (!downloadRes.ok) {
      const text = await downloadRes.text().catch(() => 'unknown');
      throw new Error(`Gosom download failed: ${downloadRes.status} ${text}`);
    }

    const csvText = await downloadRes.text();
    const places = parseGosomCsv(csvText);

    console.log(`[Gosom] Downloaded ${places.length} places from job ${jobId}`);

    if (places.length === 0) {
      throw new Error('Gosom returned empty results');
    }

    return places.slice(0, maxResults);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
