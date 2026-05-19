export const PRICING = {
  10: 39000,
  50: 39000,
  100: 69000,
  pro_monthly: 149000,
} as const;

// New monetization V1.2 pricing tiers
export const TIER_PRICING = {
  starter_kit: 39000,      // 1 kit 15-25 leads
  growth_monthly: 149000,  // 5 kit/tháng
  agency_monthly: 499000,  // Unlimited + 3 seats
} as const;

export function calculatePrice(leadCount: number | 'pro_monthly'): number {
  if (leadCount === 'pro_monthly') return PRICING.pro_monthly;
  return PRICING[leadCount as 10 | 50 | 100] || PRICING[50];
}

export function getTierName(tier: 'free' | 'starter' | 'growth' | 'agency'): string {
  const names: Record<string, string> = {
    free: 'Free',
    starter: 'Starter Kit',
    growth: 'Growth',
    agency: 'Agency',
  };
  return names[tier] || tier;
}

export function generatePaymentCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'LK';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
