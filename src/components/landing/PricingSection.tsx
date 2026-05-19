import Link from 'next/link';

const plans = [
  {
    name: 'Free',
    description: 'Dùng thử không giới hạn thởi gian',
    price: '0đ',
    period: '',
    features: [
      '1 lead full data/ngày',
      'Xem preview 3 lead khác (mask contact)',
      'Intent signals + Lead score',
      'Không cần thẻ tín dụng',
    ],
    cta: 'Đăng ký miễn phí',
    href: '/signup',
    highlighted: false,
  },
  {
    name: 'Starter Kit',
    description: 'Mua 1 lần, dùng ngay',
    price: '39.000đ',
    period: '/kit',
    features: [
      '1 kit 15-25 leads theo combo',
      'Intent signals đầy đủ',
      'AI script cá nhân hóa',
      'Export CSV',
      'SĐT xác thực',
    ],
    cta: 'Mua Starter Kit',
    href: '/signup',
    highlighted: false,
  },
  {
    name: 'Growth',
    description: 'Dành cho freelancer chuyên nghiệp',
    price: '149.000đ',
    period: '/tháng',
    features: [
      '5 kit/tháng',
      'AI script cá nhân hóa (Gemini)',
      'Export Google Sheets',
      'Lead score + Sorting',
      'Mini-CRM tracking',
      'Ưu tiên hỗ trợ',
    ],
    cta: 'Nâng cấp Growth',
    href: '/signup',
    highlighted: true,
  },
  {
    name: 'Agency',
    description: 'Dành cho agency & team',
    price: '499.000đ',
    period: '/tháng',
    features: [
      'Unlimited kits',
      '3 team seats',
      'API access',
      'White-label option',
      'Priority support',
    ],
    cta: 'Liên hệ Agency',
    href: '/signup',
    highlighted: false,
  },
];

export function PricingSection() {
  return (
    <div id="pricing" className="bg-gray-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">Bảng giá</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Không bán danh bạ. Bán cơ hội bán hàng.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-y-6 sm:mt-20 lg:max-w-5xl lg:grid-cols-4 lg:gap-x-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl p-8 ring-1 ${
                plan.highlighted
                  ? 'bg-indigo-600 ring-indigo-600 text-white scale-105 shadow-xl'
                  : 'bg-white ring-gray-200'
              }`}
            >
              <h3 className={`text-lg font-semibold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                {plan.name}
              </h3>
              <p className={`mt-4 text-sm ${plan.highlighted ? 'text-indigo-100' : 'text-gray-700'}`}>
                {plan.description}
              </p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className={`text-4xl font-bold tracking-tight ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                  {plan.price}
                </span>
                <span className={`text-sm font-semibold ${plan.highlighted ? 'text-indigo-200' : 'text-gray-700'}`}>
                  {plan.period}
                </span>
              </p>
              <ul className="mt-8 space-y-3 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className={`flex gap-x-3 ${plan.highlighted ? 'text-indigo-100' : 'text-gray-700'}`}>
                    <span className={plan.highlighted ? 'text-indigo-300' : 'text-indigo-600'}>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`mt-8 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  plan.highlighted
                    ? 'bg-white text-indigo-600 hover:bg-indigo-50 focus-visible:outline-white'
                    : 'bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
