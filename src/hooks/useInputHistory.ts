'use client';

import { useState, useCallback, useEffect } from 'react';

const MAX_HISTORY = 20;

function getStorageKey(userId: string, fieldName: string): string {
  return `leadkit:history:${userId}:${fieldName}`;
}

function readHistory(userId: string, fieldName: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(getStorageKey(userId, fieldName));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
}

function writeHistory(userId: string, fieldName: string, items: string[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getStorageKey(userId, fieldName), JSON.stringify(items));
  } catch {
    // localStorage full or disabled
  }
}

export function useInputHistory(userId: string | undefined, fieldName: string) {
  const [history, setHistory] = useState<string[]>([]);

  // Load from localStorage on mount / userId change
  useEffect(() => {
    if (!userId) {
      setHistory([]);
      return;
    }
    setHistory(readHistory(userId, fieldName));
  }, [userId, fieldName]);

  const add = useCallback(
    (value: string) => {
      if (!userId || !value || !value.trim()) return;
      const trimmed = value.trim();
      setHistory((prev) => {
        // Remove if exists, then prepend
        const filtered = prev.filter((item) => item !== trimmed);
        const next = [trimmed, ...filtered].slice(0, MAX_HISTORY);
        writeHistory(userId, fieldName, next);
        return next;
      });
    },
    [userId, fieldName]
  );

  const remove = useCallback(
    (value: string) => {
      if (!userId) return;
      setHistory((prev) => {
        const next = prev.filter((item) => item !== value);
        writeHistory(userId, fieldName, next);
        return next;
      });
    },
    [userId, fieldName]
  );

  const clear = useCallback(() => {
    if (!userId) return;
    setHistory([]);
    writeHistory(userId, fieldName, []);
  }, [userId, fieldName]);

  return { history, add, remove, clear };
}
