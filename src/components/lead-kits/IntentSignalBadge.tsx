'use client';

interface IntentSignalBadgeProps {
  signals: Array<{
    type: string;
    label: string;
    confidence?: number;
  }>;
}

export function IntentSignalBadge({ signals }: IntentSignalBadgeProps) {
  if (!signals || signals.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {signals.map((signal, idx) => (
        <span
          key={`${signal.type}-${idx}`}
          className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-gradient-to-r from-rose-50 to-orange-50 text-rose-700 border border-rose-100"
        >
          {signal.label}
        </span>
      ))}
    </div>
  );
}
