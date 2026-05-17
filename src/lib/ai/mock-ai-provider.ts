import { AIProvider, AIScriptParams } from './provider';

const TEMPLATES: Record<string, string[]> = {
  spa: [
    'Chào anh/chị {{company}}, em thấy tiệm trên Google, có gợi ý nhỏ giúp khách đặt lịch thuận tiện hơn ạ.',
    'Chào {{company}}, em chuyên hỗ trợ spa tăng booking online, cho em xin 2 phút ạ.',
    'Chào anh/chị, em đi ngang {{company}} trên Google, có ý tưởng giúp tiệm thu hút thêm khách ạ.',
  ],
  default: [
    'Chào anh/chị {{company}}, em thấy công ty trên Google, có gợi ý nhỏ giúp tiệm kinh doanh tốt hơn ạ.',
    'Chào {{company}}, em chuyên {{service}}, có giải pháp giúp tiệm tiếp cận thêm khách hàng ạ.',
    'Chào anh/chị, em đọc về {{company}} trên Google, có ý tưởng hay muốn chia sẻ ạ.',
  ],
};

export class MockAIProvider implements AIProvider {
  async generateScript(params: AIScriptParams): Promise<string> {
    const key = params.industry.toLowerCase().includes('spa') ? 'spa' : 'default';
    const templates = TEMPLATES[key] || TEMPLATES.default;

    // Deterministic selection based on company name length
    const index = params.companyName.length % templates.length;
    const script = templates[index]
      .replace(/\{\{company\}\}/g, params.companyName)
      .replace(/\{\{service\}\}/g, params.serviceName);

    return script.slice(0, 120);
  }
}
