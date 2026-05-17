'use client';

import { useState } from 'react';
import { showToast } from '@/components/ui/Toast';

interface ExportButtonProps {
  kitId: string;
}

export function ExportButton({ kitId }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch(`/api/lead-kits/${kitId}/export.csv`);
      if (!res.ok) {
        const data = await res.json();
        if (data.error === 'Kit not unlocked') {
          showToast('Vui lòng mở khóa kit trước khi export.', 'error');
          return;
        }
        throw new Error('Export failed');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leadkit-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      showToast('Export thất bại. Vui lòng thử lại.', 'error');
    } finally {
      setExporting(false);
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition disabled:opacity-50"
    >
      <span className="mr-1">📥</span>
      {exporting ? 'Đang export...' : 'Export CSV'}
    </button>
  );
}
