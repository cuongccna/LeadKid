export function DemoVideo() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Xem LeadKit hoạt động
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-700">
            Từ tìm kiếm đến liên hệ — chỉ trong 3 bước đơn giản.
          </p>
        </div>
        <div className="mt-16 flex justify-center">
          <div className="relative w-full max-w-3xl aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
            {/* Placeholder for demo video */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="mx-auto w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <p className="text-lg font-medium">Demo Video</p>
                <p className="text-sm text-gray-500 mt-1">60 giây · Coming soon</p>
              </div>
            </div>
            {/* Step indicators */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <div className="flex justify-center gap-8">
                {[
                  { step: '1', label: 'Chọn ngành & địa điểm' },
                  { step: '2', label: 'Xem pain signals' },
                  { step: '3', label: 'Sao chép & nhắn Zalo' },
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-500 text-white text-xs flex items-center justify-center font-bold">
                      {item.step}
                    </span>
                    <span className="text-white text-sm">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
