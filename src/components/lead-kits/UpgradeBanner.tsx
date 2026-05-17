'use client';

import Link from 'next/link';

export function UpgradeBanner() {
  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-4 mb-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold">Nâng cấp lên Pro</p>
          <p className="text-sm text-indigo-100">
            500 leads/ngày + AI viết lợi chào + Export Google Sheets
          </p>
        </div>
        <Link
          href="/dashboard/upgrade"
          className="bg-white text-indigo-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-50"
        >
          149.000đ/tháng
        </Link>
      </div>
    </div>
  );
}
