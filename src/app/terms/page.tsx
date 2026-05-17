export const metadata = {
  title: 'Điều khoản sử dụng — LeadKit AI',
  description:
    'Điều khoản sử dụng dịch vụ LeadKit AI. Quy định về quyền và trách nhiệm của ngưởi dùng khi sử dụng nền tảng tìm kiếm leads bằng AI.',
  robots: { index: true, follow: true },
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-24">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Điều khoản sử dụng</h1>

        <div className="prose prose-indigo max-w-none">
          <h2 className="text-xl font-semibold mt-8 mb-4">1. Chấp nhận điều khoản</h2>
          <p className="text-gray-700 mb-4">
            Bằng việc sử dụng LeadKit AI, bạn đồng ý tuân thủ các điều khoản này.
            Nếu không đồng ý, vui lòng không sử dụng dịch vụ.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">2. Không spam</h2>
          <p className="text-gray-700 mb-4">
            LeadKit AI cung cấp thông tin để bạn tiếp cận doanh nghiệp một cách có lý do chính đáng.
            Bạn cam kết không sử dụng công cụ này để gửi tin nhắn rác, quấy rối, hoặc tiếp thị không mong muốn.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">3. Trách nhiệm ngưởi dùng</h2>
          <p className="text-gray-700 mb-4">
            Bạn chịu trách nhiệm về cách sử dụng thông tin leads. LeadKit AI không chịu trách nhiệm
            pháp lý cho các hành động của bạn sau khi liên hệ leads.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">4. Không tự động gửi</h2>
          <p className="text-gray-700 mb-4">
            LeadKit AI không cung cấp tính năng tự động gửi tin nhắn Zalo, email, hoặc bất kỳ
            hình thức liên lạc nào. Mọi liên hệ đều do ngưởi dùng thực hiện thủ công.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">5. Hoàn tiền</h2>
          <p className="text-gray-700 mb-4">
            Nếu {'>'}30% leads trong một kit bị lỗi (sai số điện thoại, doanh nghiệp đã đóng cửa),
            bạn có quyền yêu cầu hoàn tiền trong vòng 7 ngày.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">6. Thay đổi điều khoản</h2>
          <p className="text-gray-700 mb-4">
            Chúng tôi có thể cập nhật điều khoản bất cứ lúc nào. Thay đổi sẽ có hiệu lực
            ngay khi được đăng tải.
          </p>
        </div>
      </div>
    </div>
  );
}
