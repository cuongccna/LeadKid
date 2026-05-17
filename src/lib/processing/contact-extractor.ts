const VN_PHONE_REGEX = /(\+?84|0)[\s.]?([3|5|7|8|9]\d{1}|2\d{1,2})[\s.]?\d{3}[\s.]?\d{3,4}/g;

export function extractPhones(text: string): string[] {
  const matches = text.match(VN_PHONE_REGEX) || [];
  const normalized = matches.map(normalizeVietnamPhone).filter((s): s is string => s !== null);
  return Array.from(new Set(normalized));
}

export function normalizeVietnamPhone(phone: string): string | null {
  const cleaned = phone.replace(/[\s.\-()+]/g, '');

  // Remove +84 or 84 prefix
  let digits = cleaned;
  if (digits.startsWith('84') && digits.length > 9) {
    digits = '0' + digits.slice(2);
  }

  // Must start with 0 and have 10-11 digits
  if (!digits.startsWith('0')) return null;
  if (digits.length < 10 || digits.length > 11) return null;

  // Validate prefix
  const prefix = digits.slice(1, 3);
  const validPrefixes = ['32', '33', '34', '35', '36', '37', '38', '39',
    '52', '56', '58', '59',
    '70', '76', '77', '78', '79',
    '81', '82', '83', '84', '85', '86', '88', '89',
    '90', '91', '92', '93', '94', '96', '97', '98', '99',
    '20', '21', '22', '23', '24', '25', '26', '27', '28', '29'];

  if (!validPrefixes.includes(prefix)) return null;

  return digits;
}

export function extractEmails(text: string): string[] {
  const regex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  return Array.from(new Set(text.match(regex) || []));
}

export function extractSocialLinks(text: string): { zalo?: string; facebook?: string } {
  const zaloMatch = text.match(/https?:\/\/zalo\.me\/[a-zA-Z0-9]+/);
  const fbMatch = text.match(/https?:\/\/(www\.)?facebook\.com\/[a-zA-Z0-9.]+/);

  return {
    zalo: zaloMatch ? zaloMatch[0] : undefined,
    facebook: fbMatch ? fbMatch[0] : undefined,
  };
}
