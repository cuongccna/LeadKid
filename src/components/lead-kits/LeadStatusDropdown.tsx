'use client';

import { useState } from 'react';

const STATUS_OPTIONS = [
  { value: 'not_contacted', label: 'Chưa liên hệ', color: 'bg-gray-100 text-gray-700' },
  { value: 'called', label: 'Đã gọi', color: 'bg-blue-100 text-blue-700' },
  { value: 'messaged', label: 'Đã nhắn Zalo', color: 'bg-indigo-100 text-indigo-700' },
  { value: 'appointed', label: 'Đã hẹn', color: 'bg-amber-100 text-amber-700' },
  { value: 'closed', label: 'Chốt deal', color: 'bg-green-100 text-green-700' },
  { value: 'rejected', label: 'Từ chối', color: 'bg-red-100 text-red-700' },
];

interface LeadStatusDropdownProps {
  leadId: string;
  initialStatus?: string;
  onChange?: (status: string) => void;
}

export function LeadStatusDropdown({ leadId, initialStatus = 'not_contacted', onChange }: LeadStatusDropdownProps) {
  const [status, setStatus] = useState(initialStatus);
  const [saving, setSaving] = useState(false);

  const currentOption = STATUS_OPTIONS.find((o) => o.value === status) || STATUS_OPTIONS[0];

  async function handleChange(newStatus: string) {
    if (newStatus === status) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/leads/${leadId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setStatus(newStatus);
        onChange?.(newStatus);
      }
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative">
      <select
        value={status}
        onChange={(e) => handleChange(e.target.value)}
        disabled={saving}
        className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer appearance-none pr-6 ${currentOption.color} ${saving ? 'opacity-50' : ''}`}
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <span className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-[10px]">▼</span>
    </div>
  );
}
