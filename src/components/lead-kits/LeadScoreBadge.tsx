'use client';

interface LeadScoreBadgeProps {
  score: number;
  label: string;
}

export function LeadScoreBadge({ score, label }: LeadScoreBadgeProps) {
  const colors: Record<string, string> = {
    hot: 'bg-red-50 text-red-700 border-red-200',
    good: 'bg-amber-50 text-amber-700 border-amber-200',
    medium: 'bg-blue-50 text-blue-700 border-blue-200',
    low: 'bg-gray-50 text-gray-600 border-gray-200',
  };

  const labels: Record<string, string> = {
    hot: '🔥 RẤT NÓNG',
    good: '⭐ TỐT',
    medium: '📊 TRUNG BÌNH',
    low: '💤 THẤP',
  };

  const colorClass = colors[label] || colors.low;
  const displayLabel = labels[label] || label.toUpperCase();

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${colorClass}`}
    >
      {displayLabel} — {score}/100
    </span>
  );
}
