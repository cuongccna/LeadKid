export interface SePayWebhookPayload {
  gateway: string;
  transactionDate: string;
  accountNumber: string;
  code: string;
  content: string;
  transferType: 'in' | 'out';
  transferAmount: number;
  accumulated: number;
  subAccount: string | null;
  referenceCode: string;
  description: string;
}

export function parseTransferContent(content: string): { paymentCode: string | null } {
  // Look for payment code pattern: LK + 6 alphanumeric chars
  const match = content.match(/(LK[A-Z0-9]{6})/i);
  return { paymentCode: match ? match[1].toUpperCase() : null };
}

export function isValidWebhookSecret(provided: string, expected: string): boolean {
  return provided === expected;
}
