const testimonials = [
  {
    body: 'Mình đã tìm được 47 spa ở Tân Phú chưa có booking online. Chỉ 2 ngày sau đã có 3 khách hàng phản hồi tích cực.',
    author: 'Minh Nguyễn',
    role: 'Freelancer Web Design',
  },
  {
    body: 'Lời chào AI của LeadKit rất tự nhiên, không giống như spam. Khách hàng thường trả lời ngay sau 5 phút.',
    author: 'Hương Trần',
    role: 'Agency Owner',
  },
  {
    body: 'Trước đây mình mất cả tuần để tìm leads thủ công. Giờ chỉ cần 2 phút với LeadKit.',
    author: 'Đức Lê',
    role: 'Digital Marketer',
  },
];

export function Testimonials() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-lg font-semibold leading-8 tracking-tight text-indigo-600">
            Đánh giá
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Người dùng nói gì về LeadKit
          </p>
        </div>
        <div className="mx-auto mt-16 flow-root max-w-2xl sm:mt-20 lg:mx-0 lg:max-w-none">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="rounded-2xl bg-gray-50 p-8 text-sm leading-6">
                <p className="text-gray-900">&ldquo;{testimonial.body}&rdquo;</p>
                <div className="mt-6 flex items-center gap-x-4">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                    {testimonial.author[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.author}</div>
                    <div className="text-gray-700">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
