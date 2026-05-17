export const PRICING = {
  10: 39000,
  50: 39000,
  100: 69000,
  pro_monthly: 149000,
} as const;

export function calculatePrice(leadCount: number | 'pro_monthly'): number {
  if (leadCount === 'pro_monthly') return PRICING.pro_monthly;
  return PRICING[leadCount as 10 | 50 | 100] || PRICING[50];
}

export function generatePaymentCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'LK';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
