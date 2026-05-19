export const SCRIPT_PROMPT_TEMPLATE = `
Bạn là chuyên gia bán hàng B2B Việt Nam với 10 năm kinh nghiệm.

Nhiệm vụ: Viết 1 câu mở đầu Zalo duy nhất (TỐI ĐA 120 ký tự) cho công ty {{company_name}}.

Thông tin pain signal: {{pain_summary}}
Dịch vụ đang bán: {{service_name}}
Ngành: {{industry}}
{{review_section}}
{{intent_section}}

QUY TẮC TUYỆT ĐỐI:
1. Khen trước, không chỉ trích
2. Không dùng từ tiêu cực: "lỗi", "tệ", "thiếu", "kém"
3. Đề xuất nhẹ nhàng, không áp lực
4. CTA ít áp lực: "cho em góp ý", "em có gợi ý nhỏ"
5. Sử dụng tiếng Việt có dấu, giọng điệu thân thiện
6. Tối đa 120 ký tự (bao gồm cả dấu cách)
7. Nếu có intent signal (họ đang tuyển dụng/chạy ads), ĐÁNH ĐỘNG đến điều đó để tạo sự liên quan

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
  reviewInsight?: string | null;
  rating?: number | null;
  userRatingCount?: number | null;
  intentSignals?: Array<{ type: string; label: string; confidence?: number }>;
  intentSummary?: string;
}): string {
  let reviewSection = '';
  if (params.reviewInsight) {
    reviewSection = `\nThông tin đánh giá Google Maps: ${params.reviewInsight}`;
    if (params.rating && params.userRatingCount) {
      reviewSection += ` (${params.rating}★ / ${params.userRatingCount} đánh giá)`;
    }
  }

  let intentSection = '';
  if (params.intentSignals && params.intentSignals.length > 0) {
    intentSection = `\nDấu hiệu nhu cầu (intent signals): ${params.intentSummary || params.intentSignals.map((s) => s.label).join(', ')}`;
  }

  return SCRIPT_PROMPT_TEMPLATE
    .replace(/\{\{company_name\}\}/g, params.companyName)
    .replace(/\{\{company\}\}/g, params.companyName)
    .replace(/\{\{pain_summary\}\}/g, params.painSummary || 'chưa có thông tin cụ thể')
    .replace(/\{\{service_name\}\}/g, params.serviceName)
    .replace(/\{\{review_section\}\}/g, reviewSection)
    .replace(/\{\{intent_section\}\}/g, intentSection);
}
