export function maskPhone(phone: string): string {
  const cleaned = phone.replace(/\s/g, '');
  if (cleaned.length < 8) return '***';
  return cleaned.slice(0, 4) + '***' + cleaned.slice(-3);
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  return local.slice(0, Math.min(5, local.length)) + '***@' + domain;
}

export function maskUrl(url: string): string {
  try {
    const u = new URL(url);
    return `${u.hostname}/***`;
  } catch {
    return '***';
  }
}

export function maskScript(script: string | null): string {
  if (!script) return '***';
  if (script.length <= 15) return script.slice(0, 5) + '***';
  return script.slice(0, 12) + '... [Mở khóa để xem]';
}
