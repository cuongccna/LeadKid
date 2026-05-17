'use client';

const SIGNAL_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  no_website: {
    label: 'Chưa có website',
    color: 'text-red-700',
    bg: 'bg-red-100',
  },
  no_zalo_chat: {
    label: 'Chưa có Zalo chat',
    color: 'text-orange-700',
    bg: 'bg-orange-100',
  },
  no_booking: {
    label: 'Chưa có đặt lịch',
    color: 'text-blue-700',
    bg: 'bg-blue-100',
  },
  slow_website: {
    label: 'Website chậm',
    color: 'text-yellow-700',
    bg: 'bg-yellow-100',
  },
};

interface PainSignalBadgeProps {
  signals: string[];
}

export function PainSignalBadge({ signals }: PainSignalBadgeProps) {
  if (!signals || signals.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {signals.map((signal) => {
        const config = SIGNAL_CONFIG[signal] || {
          label: signal,
          color: 'text-gray-700',
          bg: 'bg-gray-100',
        };
        return (
          <span
            key={signal}
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.color}`}
          >
            {config.label}
          </span>
        );
      })}
    </div>
  );
}
