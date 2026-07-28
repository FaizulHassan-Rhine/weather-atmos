"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * SSR-safe localStorage hook. Starts with `initialValue` on the server
 * and hydrates from storage after mount to avoid mismatches.
 */
export default function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item != null) {
        setStoredValue(JSON.parse(item));
      }
    } catch {
      // Ignore corrupt storage
    } finally {
      setHydrated(true);
    }
  }, [key]);

  const setValue = useCallback(
    (value) => {
      setStoredValue((prev) => {
        const next = typeof value === "function" ? value(prev) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(next));
        } catch {
          // Quota or private mode — keep in-memory value
        }
        return next;
      });
    },
    [key]
  );

  return [storedValue, setValue, hydrated];
}
