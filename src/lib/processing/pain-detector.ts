export interface PainSignals {
  signals: string[];
  summary: string;
}

const PAIN_RULES = [
  {
    id: 'no_website',
    label: 'Chưa có website',
    check: (ctx: { websiteUri?: string | null }) => !ctx.websiteUri,
  },
  {
    id: 'no_zalo_chat',
    label: 'Chưa có Zalo chat',
    check: (ctx: { html?: string | null }) => {
      if (!ctx.html) return true;
      return !ctx.html.includes('zalo.me');
    },
  },
  {
    id: 'no_booking',
    label: 'Chưa có đặt lịch online',
    check: (ctx: { html?: string | null }) => {
      if (!ctx.html) return true;
      const bookingKeywords = /đặt lịch|booking|đặt chỗ|schedule|appointment/i;
      return !bookingKeywords.test(ctx.html);
    },
  },
  {
    id: 'slow_website',
    label: 'Website tải chậm',
    check: (ctx: { loadTime?: number }) => {
      if (!ctx.loadTime) return false;
      return ctx.loadTime > 3000;
    },
  },
];

export function detectPainSignals(ctx: {
  websiteUri?: string | null;
  html?: string | null;
  loadTime?: number;
}): PainSignals {
  const matched = PAIN_RULES.filter((rule) => rule.check(ctx))
    .slice(0, 2); // Max 2 signals

  const signals = matched.map((r) => r.id);
  const labels = matched.map((r) => r.label);

  let summary = '';
  if (labels.length === 0) {
    summary = 'Chưa phát hiện vấn đề rõ ràng';
  } else if (labels.length === 1) {
    summary = labels[0];
  } else {
    summary = `${labels[0]}, ${labels[1]}`;
  }

  return { signals, summary };
}
