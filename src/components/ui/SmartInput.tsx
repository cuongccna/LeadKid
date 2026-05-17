'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface SmartInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  history: string[];
  onRemoveHistory: (value: string) => void;
}

export function SmartInput({
  label,
  value,
  onChange,
  placeholder,
  required,
  history,
  onRemoveHistory,
}: SmartInputProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter history by current value (prefix match)
  const filtered = history.filter((item) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return item.toLowerCase().includes(q);
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Escape key closes dropdown
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        setOpen(false);
        inputRef.current?.blur();
      }
    },
    []
  );

  function handleSelect(item: string) {
    onChange(item);
    setQuery('');
    setOpen(false);
    inputRef.current?.blur();
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value;
    onChange(newValue);
    setQuery(newValue);
    if (!open && history.length > 0) {
      setOpen(true);
    }
  }

  function handleFocus() {
    if (history.length > 0) {
      setQuery(value);
      setOpen(true);
    }
  }

  const showDropdown = open && filtered.length > 0;

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
        {label}
      </label>
      <input
        ref={inputRef}
        type="text"
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        className="block w-full px-3 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                   focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
                   text-base sm:text-sm text-gray-900 dark:text-gray-100 
                   placeholder:text-gray-500 dark:placeholder:text-gray-400 
                   bg-white dark:bg-gray-800 transition-colors"
      />

      {showDropdown && (
        <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg overflow-hidden">
          <ul className="max-h-60 overflow-y-auto py-1">
            {filtered.map((item) => (
              <li
                key={item}
                className="flex items-center justify-between px-3 py-2.5 sm:py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition group"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(item);
                }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-gray-400 text-xs shrink-0">🕐</span>
                  <span className="text-sm text-gray-700 dark:text-gray-200 truncate">
                    {highlightMatch(item, query)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveHistory(item);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition px-1.5 py-0.5 rounded hover:bg-red-50 shrink-0"
                  title="Xóa khỏi lịch sử"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
          {filtered.length === 0 && query && (
            <div className="px-3 py-2 text-xs text-gray-400 italic">
              Không có gợi ý phù hợp
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const q = query.toLowerCase();
  const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === q ? (
          <span key={i} className="bg-yellow-100 text-gray-900 font-medium">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
