"use client";

import { useCallback, useEffect } from "react";
import useLocalStorage from "./useLocalStorage";

export default function useTheme() {
  const [theme, setTheme, hydrated] = useLocalStorage("atmos-theme", null);

  useEffect(() => {
    if (!hydrated) return;

    let resolved = theme;
    if (!resolved) {
      resolved = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      setTheme(resolved);
      return;
    }

    document.documentElement.classList.toggle("dark", resolved === "dark");
  }, [theme, hydrated, setTheme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const current =
        prev ??
        (document.documentElement.classList.contains("dark") ? "dark" : "light");
      return current === "dark" ? "light" : "dark";
    });
  }, [setTheme]);

  const resolvedTheme =
    theme ?? (typeof document !== "undefined" && document.documentElement.classList.contains("dark")
      ? "dark"
      : "light");

  return {
    theme: resolvedTheme,
    toggleTheme,
    setTheme,
    hydrated,
  };
}
