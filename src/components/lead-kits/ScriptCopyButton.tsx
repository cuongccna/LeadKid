'use client';

import { useState } from 'react';

interface ScriptCopyButtonProps {
  script: string | null;
}

export function ScriptCopyButton({ script }: ScriptCopyButtonProps) {
  const [copied, setCopied] = useState(false);

  if (!script) return null;

  async function handleCopy() {
    if (!script) return;
    try {
      await navigator.clipboard.writeText(script);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = script;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 rounded hover:bg-indigo-100 transition"
    >
      {copied ? (
        <>
          <span className="mr-1">✓</span> Đã sao chép
        </>
      ) : (
        <>
          <span className="mr-1">📋</span> Sao chép lợi chào
        </>
      )}
    </button>
  );
}
