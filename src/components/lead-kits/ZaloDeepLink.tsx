'use client';

interface ZaloDeepLinkProps {
  phone: string | null;
  script: string | null;
}

export function ZaloDeepLink({ phone, script }: ZaloDeepLinkProps) {
  if (!phone) return null;

  const cleanPhone = phone.replace(/\D/g, '');
  const message = script || `Chào anh/chị, em có gợi ý nhỏ giúp tiệm ạ.`;
  const encodedMessage = encodeURIComponent(message);
  const zaloUrl = `https://zalo.me/${cleanPhone}?text=${encodedMessage}`;

  return (
    <a
      href={zaloUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition"
    >
      <span className="mr-1">💬</span> Nhắn Zalo
    </a>
  );
}
