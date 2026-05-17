import Link from 'next/link';

const plans = [
  {
    name: 'Free',
    description: 'Dùng thử không giới hạn thởi gian',
    price: '0đ',
    period: '',
    features: ['5 leads full data/ngày', 'Pain signals cơ bản', 'Xem SĐT không che', 'Không cần thẻ tín dụng'],
    cta: 'Đăng ký miễn phí',
    href: '/signup',
    highlighted: false,
  },
  {
    name: 'Express Kit',
    description: 'Mua 1 lần, dùng ngay',
    price: '39.000đ',
    period: '/50 leads',
    features: ['50 leads instant', 'Pain signals đầy đủ', 'Export CSV', 'AI script template'],
    cta: 'Mua ngay',
    href: '/signup',
    highlighted: false,
  },
  {
    name: 'Pro',
    description: 'Dành cho chuyên nghiệp',
    price: '149.000đ',
    period: '/tháng',
    features: [
      '500 leads/ngày',
      'AI viết lợi chào (Gemini)',
      'Export Google Sheets',
      'Không giới hạn kit',
      'Ưu tiên hỗ trợ',
    ],
    cta: 'Nâng cấp Pro',
    href: '/signup',
    highlighted: true,
  },
];

export function PricingSection() {
  return (
    <div id="pricing" className="bg-gray-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">Bảng giá</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Đơn giản, rõ ràng, không ẩn phí
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-y-6 sm:mt-20 lg:max-w-4xl lg:grid-cols-3 lg:gap-x-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl p-8 ring-1 ${
                plan.highlighted
                  ? 'bg-indigo-600 ring-indigo-600 text-white'
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
