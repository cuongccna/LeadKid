import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const baseUrl = process.env.APP_URL || 'https://slm.io.vn';

  const robots = `User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /api/
Disallow: /login
Disallow: /signup

Sitemap: ${baseUrl}/sitemap.xml
`;

  return new NextResponse(robots, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
