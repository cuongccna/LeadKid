'use client';

export default function GlobalError({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
            <div className="text-5xl mb-4">😵</div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Hệ thống gặp sự cố</h1>
            <p className="text-gray-500 mb-6">
              Rất tiếc, hệ thống đang gặp lỗi nghiêm trọng. Vui lòng thử lại.
            </p>
            <button
              onClick={reset}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
            >
              Tải lại ứng dụng
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
