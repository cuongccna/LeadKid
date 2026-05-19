'use client';

interface PhoneVerificationBadgeProps {
  status: string | null;
}

export function PhoneVerificationBadge({ status }: PhoneVerificationBadgeProps) {
  if (status === 'verified') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
        <span>✅</span> SĐT đã xác thực
      </span>
    );
  }

  if (status === 'reported_bad') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
        <span>❌</span> SĐT báo lỗi
      </span>
    );
  }

  // unverified or null
  return (
    <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
      <span>🟡</span> SĐT chưa xác thực
    </span>
  );
}
