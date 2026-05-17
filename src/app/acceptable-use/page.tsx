export const metadata = {
  title: 'Chính sách sử dụng hợp lệ — LeadKit AI',
  description:
    'Chính sách sử dụng hợp lệ LeadKit AI. Quy định các hoạt động được phép và bị cấm khi sử dụng dữ liệu leads từ nền tảng.',
  robots: { index: true, follow: true },
  alternates: { canonical: '/acceptable-use' },
};

export default function AcceptableUsePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-24">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Chính sách sử dụng hợp lệ</h1>

        <div className="prose prose-indigo max-w-none">
          <h2 className="text-xl font-semibold mt-8 mb-4">Hoạt động được phép ✓</h2>
          <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
            <li>Tìm kiếm leads cho dịch vụ của bạn (web design, SEO, marketing...)</li>
            <li>Liên hệ doanh nghiệp với lý do chính đáng và cách tiếp cận chuyên nghiệp</li>
            <li>Export dữ liệu đã mua cho mục đích cá nhân hoặc nội bộ công ty</li>
            <li>Báo cáo leads có thông tin sai/lỗi để cải thiện chất lượng</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">Hoạt động bị cấm ✗</h2>
          <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
            <li>Quấy rối, đe dọa, hoặc gửi tin nhắn rác đến doanh nghiệp</li>
            <li>Bán lại dữ liệu leads nguyên bản cho bên thứ ba</li>
            <li>Sử dụng bot hoặc automation để thu thập dữ liệu từ LeadKit</li>
            <li>Tạo nhiều tài khoản để lạm dụng giới hạn miễn phí</li>
            <li>Sử dụng thông tin cho mục đích bất hợp pháp</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">Hậu quả vi phạm</h2>
          <p className="text-gray-600 mb-4">
            Vi phạm chính sách này có thể dẫn đến khóa tài khoản vĩnh viễn, mất quyền truy cập
            dữ liệu đã mua, và trong trường hợp nghiêm trọng, chuyển giao cho cơ quan chức năng.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">Báo cáo vi phạm</h2>
          <p className="text-gray-600 mb-4">
            Nếu bạn phát hiện ngưởi dùng khác vi phạm chính sách, vui lòng báo cáo qua email
            support@leadkit.vn.
          </p>
        </div>
      </div>
    </div>
  );
}
