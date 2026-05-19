import Link from 'next/link';

export function HeroSection() {
  return (
    <div className="relative isolate overflow-hidden bg-white">
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Tìm doanh nghiệp đang{' '}
            <span className="text-indigo-600">CHI TIỀN</span> cho marketing
            <br className="hidden sm:block" />
            nhưng bỏ lỡ khách vì không có website/booking tốt
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-700">
            LeadKit AI tìm doanh nghiệp đang chạy quảng cáo, đăng tuyển nhân sự — nhưng website chưa có form đặt lịch. 
            Bạn nhận được SĐT xác thực, biết họ đang cần gì, và script tiếp cận viết riêng cho từng ngườ.
          </p>

          {/* Trust badges */}
          <div className="mt-8 flex flex-wrap justify-center gap-3 text-xs font-medium text-gray-600">
            <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1.5 rounded-full">
              ✅ SĐT đã xác thực
            </span>
            <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 px-3 py-1.5 rounded-full">
              🔥 Biết họ đang chạy quảng cáo
            </span>
            <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full">
              💬 Script tiếp cận viết riêng
            </span>
            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full">
              🛡️ Hoàn tiền nếu &gt;20% lead lỗi
            </span>
          </div>

          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/signup"
              className="rounded-md bg-indigo-600 px-8 py-4 text-base font-bold text-white shadow-lg hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition"
            >
              🎁 XEM 1 LEAD MIỄN PHÍ
            </Link>
            <Link
              href="/login"
              className="rounded-md bg-white px-6 py-4 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Đăng nhập
            </Link>
          </div>
          <p className="mt-4 text-xs text-gray-500">Không cần thẻ tín dụng · 1 lead full data miễn phí mỗi ngày</p>
        </div>
      </div>
    </div>
  );
}
