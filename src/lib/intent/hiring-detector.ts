import { IntentDetector, IntentSignal, IntentDetectorInput } from './detector';

const HIRING_KEYWORDS = [
  'tuyển dụng',
  'tuyển',
  'tuyển nhân viên',
  'tuyển gấp',
  'tuyển dụng nhân sự',
  'recruitment',
  'careers',
  'join our team',
  'we are hiring',
  'cần tuyển',
  'tuyển chuyên viên',
  'tuyển kỹ thuật viên',
  'tuyển marketing',
  'tuyển sales',
  'tuyển nhân sự',
  'tuyển lễ tân',
  'tuyển kỹ sư',
  'tuyển designer',
  'tuyển lập trình',
];

export class HiringDetector implements IntentDetector {
  name = 'hiring';

  async detect(input: IntentDetectorInput): Promise<IntentSignal[]> {
    const signals: IntentSignal[] = [];

    if (!input.html) return signals;

    const htmlLower = input.html.toLowerCase();

    // Check for hiring keywords in HTML
    const foundKeywords = HIRING_KEYWORDS.filter((kw) =>
      htmlLower.includes(kw.toLowerCase())
    );

    if (foundKeywords.length > 0) {
      signals.push({
        type: 'recently_hiring',
        label: '💼 Vừa đăng tuyển nhân sự',
        confidence: Math.min(0.5 + foundKeywords.length * 0.1, 0.9),
        source: 'website_html',
        evidence: `Tìm thấy từ khóa: ${foundKeywords.slice(0, 3).join(', ')}`,
      });
    }

    // Check for career page links
    const careerPatterns = [
      /href="[^"]*(?:tuyen-dung|tuyendung|careers|jobs|join-us|recruitment)[^"]*"/i,
    ];

    for (const pattern of careerPatterns) {
      if (pattern.test(input.html)) {
        signals.push({
          type: 'recently_hiring',
          label: '💼 Đang tuyển dụng',
          confidence: 0.7,
          source: 'website_links',
          evidence: 'Trang web có link tuyển dụng',
        });
        break;
      }
    }

    return signals;
  }
}

export function createHiringDetector(): HiringDetector {
  return new HiringDetector();
}
