import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const baseUrl = process.env.APP_URL || 'https://slm.io.vn';

  const routes = [
    { path: '', priority: 1.0, changefreq: 'daily' as const },
    { path: '/login', priority: 0.5, changefreq: 'monthly' as const },
    { path: '/signup', priority: 0.6, changefreq: 'monthly' as const },
    { path: '/dashboard', priority: 0.8, changefreq: 'daily' as const },
    { path: '/dashboard/upgrade', priority: 0.7, changefreq: 'weekly' as const },
    { path: '/privacy', priority: 0.3, changefreq: 'yearly' as const },
    { path: '/terms', priority: 0.3, changefreq: 'yearly' as const },
    { path: '/acceptable-use', priority: 0.3, changefreq: 'yearly' as const },
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${baseUrl}${route.path}</loc>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
