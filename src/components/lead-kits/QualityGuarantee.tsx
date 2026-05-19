'use client';

export function QualityGuarantee() {
  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4">
      <div className="flex items-center gap-2">
        <span className="text-lg">🛡️</span>
        <div>
          <p className="text-sm font-semibold text-emerald-800">
            Cam kết chất lượng
          </p>
          <p className="text-xs text-emerald-700">
            Hoàn tiền 100% nếu &gt;20% SĐT không liên lạc được hoặc lead không khớp ngành/khu vực.
          </p>
        </div>
      </div>
    </div>
  );
}
