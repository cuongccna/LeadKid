import { HeroSection } from '@/components/landing/HeroSection';
import { DemoVideo } from '@/components/landing/DemoVideo';
import { PricingSection } from '@/components/landing/PricingSection';
import { Testimonials } from '@/components/landing/Testimonials';
import { CTASection } from '@/components/landing/CTASection';

const APP_URL = process.env.APP_URL || 'https://slm.io.vn';

export const metadata = {
  title: 'LeadKit AI — Tìm khách hàng tiềm năng cho SME',
  description:
    'Tìm doanh nghiệp đang bỏ lỡ tiền, cho bạn lý do chính đáng để liên hệ ngay hôm nay. 1 lead full data miễn phí mỗi ngày.',
  openGraph: {
    title: 'LeadKit AI — Tìm khách hàng tiềm năng',
    description: 'AI-powered lead intelligence cho freelancer và agency tại Việt Nam',
    type: 'website',
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'LeadKit AI',
  url: APP_URL,
  logo: `${APP_URL}/logo.png`,
  description:
    'AI-powered lead generation platform cho freelancer và SME tại Việt Nam. Tìm khách hàng tiềm năng từ Google Maps, phân tích pain points và tạo lợi chào bán hàng bằng AI.',
  sameAs: [],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    availableLanguage: ['Vietnamese'],
  },
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'LeadKit AI',
  url: APP_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${APP_URL}/dashboard?search={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'LeadKit AI',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Any',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'VND',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '128',
  },
  featureList: [
    'Tìm leads từ Google Maps',
    'Phân tích pain points doanh nghiệp',
    'AI viết lợi chào bán hàng',
    'Export CSV',
    'Zalo deep link',
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'LeadKit AI là gì?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'LeadKit AI là nền tảng tìm kiếm khách hàng tiềm năng bằng AI cho freelancer và doanh nghiệp SME tại Việt Nam. Hệ thống tự động tìm doanh nghiệp từ Google Maps, phân tích điểm yếu và tạo lợi chào bán hàng.',
      },
    },
    {
      '@type': 'Question',
      name: 'LeadKit AI có miễn phí không?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Có, bạn được xem 1 lead full data miễn phí mỗi ngày và tạo 1 lead kit mỗi ngày. Nâng cấp Pro chỉ 149.000đ/tháng để có 500 leads/ngày và không giới hạn tính năng.',
      },
    },
    {
      '@type': 'Question',
      name: 'Dữ liệu leads từ đâu?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Dữ liệu được thu thập trực tiếp từ Google Maps với thông tin công khai như tên doanh nghiệp, địa chỉ, số điện thoại, website và đánh giá.',
      },
    },
    {
      '@type': 'Question',
      name: 'Làm sao để sử dụng LeadKit AI?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Bước 1: Đăng ký tài khoản. Bước 2: Nhập dịch vụ của bạn, ngành mục tiêu và địa điểm. Bước 3: Hệ thống AI sẽ tìm leads, phân tích pain points và tạo lợi chào. Bước 4: Liên hệ khách hàng qua Zalo hoặc điện thoại.',
      },
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <main>
        <HeroSection />
        <DemoVideo />
        <PricingSection />
        <Testimonials />
        <CTASection />

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-12">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-center md:text-left">
                <p className="text-sm font-semibold text-gray-900">LeadKit AI</p>
                <p className="text-xs text-gray-600 mt-1">Vietnam SME Lead Intelligence Kit</p>
              </div>
              <div className="flex gap-6 text-sm text-gray-600">
                <a href="/privacy" className="hover:text-gray-900">Chính sách riêng tư</a>
                <a href="/terms" className="hover:text-gray-900">Điều khoản</a>
                <a href="/acceptable-use" className="hover:text-gray-900">Sử dụng hợp lệ</a>
              </div>
              <p className="text-xs text-gray-500">© 2024 LeadKit AI. Sử dụng hợp pháp, không spam.</p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
