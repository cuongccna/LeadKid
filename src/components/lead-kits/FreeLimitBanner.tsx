'use client';

import Link from 'next/link';

interface FreeLimitBannerProps {
  remaining: number;
}

export function FreeLimitBanner({ remaining }: FreeLimitBannerProps) {
  if (remaining <= 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-red-700 font-medium">
          Bạn đã hết lượt xem lead miễn phí hôm nay.{' '}
          <Link href="/dashboard/upgrade" className="underline">
            Nâng cấp Pro
          </Link>{' '}
          để xem không giới hạn.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <p className="text-sm text-blue-700">
        Bạn còn <span className="font-bold">{remaining}</span> lead miễn phí hôm nay.
      </p>
    </div>
  );
}
