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

/* ─── Review-based Pain Detection ─── */

export interface ReviewPainSignals {
  signals: string[];
  summary: string;
  pitchAngle: string;
}

export function detectReviewPainSignals(
  reviewsPerRating?: Record<string, number> | null,
  userRatingCount?: number | null,
  rating?: number | null
): ReviewPainSignals | null {
  if (!reviewsPerRating || !userRatingCount || userRatingCount === 0) {
    return null;
  }

  const total = userRatingCount;
  const r1 = reviewsPerRating['1'] || reviewsPerRating['1.0'] || 0;
  const r2 = reviewsPerRating['2'] || reviewsPerRating['2.0'] || 0;
  const r3 = reviewsPerRating['3'] || reviewsPerRating['3.0'] || 0;

  const lowStars = r1 + r2;
  const midStars = r3;

  const lowStarPct = total > 0 ? (lowStars / total) * 100 : 0;
  const midStarPct = total > 0 ? (midStars / total) * 100 : 0;

  const signals: string[] = [];
  let summary = '';
  let pitchAngle = '';

  // Rule 1: High negative reviews (>25% 1-2★)
  if (lowStarPct > 25) {
    signals.push('high_negative_reviews');
    summary = `${Math.round(lowStarPct)}% đánh giá 1-2 sao — nhiều phàn nàn từ khách hàng`;
    pitchAngle = 'Cải thiện trải nghiệm khách hàng và quản lý đánh giá online';
  }
  // Rule 2: Mixed sentiment (many 3★)
  else if (midStarPct > 30) {
    signals.push('mixed_reviews');
    summary = `${Math.round(midStarPct)}% đánh giá 3 sao — khách hài lòng vừa phải, có tiềm năng cải thiện`;
    pitchAngle = 'Nâng cao chất lượng dịch vụ để tăng sự hài lòng khách hàng';
  }
  // Rule 3: Few reviews but good rating (<20 reviews, >4.0★)
  else if (total < 20 && (rating || 0) >= 4.0) {
    signals.push('few_reviews');
    summary = `Chỉ ${total} đánh giá — doanh nghiệp mới hoặc ít được biết đến trên Google`;
    pitchAngle = 'Tăng số lượng đánh giá và xây dựng uy tín trên Google Maps';
  }
  // Rule 4: Many reviews, very high rating (>100 reviews, >4.5★)
  else if (total > 100 && (rating || 0) > 4.5) {
    signals.push('strong_reputation');
    summary = `${total} đánh giá ${rating}★ — uy tín cao, có thể mở rộng`;
    pitchAngle = 'Tận dụng uy tín để mở rộng kênh marketing online';
  }

  if (signals.length === 0) {
    return null;
  }

  return { signals, summary, pitchAngle };
}
