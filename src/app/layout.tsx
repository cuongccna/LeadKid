import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { ToastContainer } from '@/components/ui/Toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#4f46e5',
};

const APP_URL = process.env.APP_URL || 'https://slm.io.vn';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'LeadKit AI — Tìm khách hàng tiềm năng cho SME tại Việt Nam',
    template: '%s — LeadKit AI',
  },
  description:
    'LeadKit AI giúp freelancer và agency tìm khách hàng tiềm năng từ Google Maps, phân tích điểm yếu doanh nghiệp và tạo lợi chào bán hàng bằng AI. 1 lead full data miễn phí mỗi ngày.',
  keywords: [
    'lead generation',
    'tìm khách hàng tiềm năng',
    'SME',
    'Vietnam',
    'B2B sales',
    'prospecting',
    'Zalo marketing',
    'Google Maps scraper',
    'AI sales assistant',
    'tìm lead spa',
    'tìm lead nhà hàng',
    'dữ liệu doanh nghiệp',
  ],
  authors: [{ name: 'LeadKit AI', url: APP_URL }],
  creator: 'LeadKit AI',
  publisher: 'LeadKit AI',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'LeadKit AI — Tìm khách hàng tiềm năng cho SME',
    description:
      'Tìm doanh nghiệp đang bỏ lỡ tiền, cho bạn lý do chính đáng để liên hệ ngay hôm nay. AI-powered lead intelligence cho freelancer và agency tại Việt Nam.',
    type: 'website',
    locale: 'vi_VN',
    url: APP_URL,
    siteName: 'LeadKit AI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'LeadKit AI — Tìm khách hàng tiềm năng cho SME tại Việt Nam',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LeadKit AI — Tìm khách hàng tiềm năng cho SME',
    description: 'AI-powered lead intelligence cho freelancer và agency tại Việt Nam',
    images: ['/og-image.png'],
  },
  verification: {
    google: 'YOUR_GOOGLE_SEARCH_CONSOLE_ID',
  },
  category: 'business',
  classification: 'Lead Generation, B2B Marketing, AI Tools',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <ErrorBoundary>
          <Providers>
            {children}
            <ToastContainer />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
