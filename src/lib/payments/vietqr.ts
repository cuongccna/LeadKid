export interface VietQRParams {
  bankCode: string;
  accountNumber: string;
  amount: number;
  description: string;
  accountName: string;
}

export function generateVietQRString(params: VietQRParams): string {
  // Simplified VietQR payload generation
  // In production, use a proper VietQR library or implement full Napas spec
  const { bankCode, accountNumber, amount, description } = params;

  const payloadId = '000201';
  const method = '010212'; // QR Dynamic
  const merchantInfo = buildMerchantInfo(bankCode, accountNumber);
  const amountField = amount > 0 ? buildAmount(amount) : '';
  const purpose = buildPurpose(description);
  const crc = '6304'; // CRC placeholder

  const payload = payloadId + method + merchantInfo + amountField + purpose + crc;
  return payload;
}

function buildMerchantInfo(bankCode: string, accountNumber: string): string {
  const bankId = '00' + bankCode;
  const bankLen = String(bankId.length).padStart(2, '0');
  const bankField = '38' + String(4 + bankId.length).padStart(2, '0') + '01' + bankLen + bankId;

  const accLen = String(accountNumber.length).padStart(2, '0');
  const accField = '02' + accLen + accountNumber;

  const merchantLen = String(6 + bankField.length + accField.length).padStart(2, '0');
  return '38' + merchantLen + bankField + accField;
}

function buildAmount(amount: number): string {
  const amountStr = String(amount);
  const len = String(amountStr.length).padStart(2, '0');
  return '54' + len + amountStr;
}

function buildPurpose(description: string): string {
  const len = String(description.length).padStart(2, '0');
  return '08' + len + description;
}

export function getBankQRUrl(params: VietQRParams): string {
  // Using VietQR API for actual QR image generation
  const { bankCode, accountNumber, amount, description, accountName } = params;
  const encodedDesc = encodeURIComponent(description);
  const encodedName = encodeURIComponent(accountName);

  return `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact2.png?amount=${amount}&addInfo=${encodedDesc}&accountName=${encodedName}`;
}
