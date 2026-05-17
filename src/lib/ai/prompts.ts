export const SCRIPT_PROMPT_TEMPLATE = `
Bạn là chuyên gia bán hàng B2B Việt Nam với 10 năm kinh nghiệm.

Nhiệm vụ: Viết 1 câu mở đầu Zalo duy nhất (TỐI ĐA 120 ký tự) cho công ty {{company_name}}.

Thông tin pain signal: {{pain_summary}}
Dịch vụ đang bán: {{service_name}}
Ngành: {{industry}}

QUY TẮC TUYỆT ĐỐI:
1. Khen trước, không chỉ trích
2. Không dùng từ tiêu cực: "lỗi", "tệ", "thiếu", "kém"
3. Đề xuất nhẹ nhàng, không áp lực
4. CTA ít áp lực: "cho em góp ý", "em có gợi ý nhỏ"
5. Sử dụng tiếng Việt có dấu, giọng điệu thân thiện
6. Tối đa 120 ký tự (bao gồm cả dấu cách)

VÍ DỤ TỐT:
"Chào anh/chị {{company}}, em thấy tiệm trên Google, có gợi ý nhỏ giúp khách đặt lịch thuận tiện hơn ạ."
"Chào {{company}}, em là Minh chuyên hỗ trợ spa tăng booking online, cho em xin 2 phút ạ."

VÍ DỤ XẤU (KHÔNG LÀM THEO):
- "Website {{company}} lỗi nặng, cần fix ngay"
- "{{company}} thiếu SEO, đang bỏ lỡ khách hàng"

TRẢ LỜI CHỈ 1 CÂU, KHÔNG GIẢI THÍCH. ĐẾM KỸ SỐ KÝ TỰ.
`;

export function buildPrompt(params: {
  companyName: string;
  painSummary: string | null;
  serviceName: string;
  industry: string;
}): string {
  return SCRIPT_PROMPT_TEMPLATE
    .replace(/\{\{company_name\}\}/g, params.companyName)
    .replace(/\{\{company\}\}/g, params.companyName)
    .replace(/\{\{pain_summary\}\}/g, params.painSummary || 'chưa có thông tin cụ thể')
    .replace(/\{\{service_name\}\}/g, params.serviceName)
    .replace(/\{\{industry\}\}/g, params.industry);
}
