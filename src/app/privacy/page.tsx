export const metadata = {
  title: 'Chính sách riêng tư — LeadKit AI',
  description:
    'Chính sách riêng tư của LeadKit AI. Chúng tôi thu thập dữ liệu công khai từ Google Maps và bảo vệ thông tin cá nhân của bạn.',
  robots: { index: true, follow: true },
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-24">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Chính sách riêng tư</h1>

        <div className="prose prose-indigo max-w-none">
          <h2 className="text-xl font-semibold mt-8 mb-4">1. Dữ liệu chúng tôi thu thập</h2>
          <p className="text-gray-600 mb-4">
            LeadKit AI thu thập dữ liệu công khai từ Google Places API và các nguồn công khai khác.
            Chúng tôi không thu thập dữ liệu cá nhân nhạy cảm ngoài thông tin bạn cung cấp khi đăng ký
            (email, tên, tên công ty).
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">2. Nguồn dữ liệu leads</h2>
          <p className="text-gray-600 mb-4">
            Thông tin doanh nghiệp (tên, địa chỉ, số điện thoại, website) được lấy từ Google Business Profile
            — nền tảng công khai mà các doanh nghiệp tự cung cấp thông tin. Chúng tôi không thu thập
            dữ liệu từ nguồn riêng tư hoặc trái phép.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">3. Lưu trữ và bảo mật</h2>
          <p className="text-gray-600 mb-4">
            Dữ liệu được lưu trữ trên PostgreSQL với mã hóa. Mật khẩu được hash bằng bcrypt.
            Chúng tôi không bán hoặc chia sẻ dữ liệu cá nhân của bạn với bên thứ ba.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">4. Quyền của bạn</h2>
          <p className="text-gray-600 mb-4">
            Bạn có quyền yêu cầu xóa tài khoản và dữ liệu cá nhân bất cứ lúc nào.
            Liên hệ: support@leadkit.vn
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">5. Cookie</h2>
          <p className="text-gray-600 mb-4">
            Chúng tôi chỉ sử dụng cookie cần thiết cho xác thực (NextAuth session).
            Không có cookie tracking hoặc quảng cáo.
          </p>
        </div>
      </div>
    </div>
  );
}
