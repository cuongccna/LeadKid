import Link from 'next/link';

export function CTASection() {
  return (
    <div className="bg-indigo-600">
      <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Bắt đầu tìm khách hàng ngay hôm nay
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-indigo-200">
            5 leads miễn phí mỗi ngày. Không cần thẻ tín dụng. Không ràng buộc.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/signup"
              className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Dùng thử miễn phí
            </Link>
            <Link href="#pricing" className="text-sm font-semibold leading-6 text-white">
              Xem bảng giá <span aria-hidden="true">→</span>
            </Link>
          </div>
          <p className="mt-4 text-xs text-indigo-300">
            Hoàn tiền nếu {'>'}30% lead lỗi · Không spam · Tuân thủ pháp luật VN
          </p>
        </div>
      </div>
    </div>
  );
}
