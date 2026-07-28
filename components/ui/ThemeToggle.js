"use client";

import { Moon, Sun } from "lucide-react";

export default function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-sky/40 bg-surface text-text transition hover:border-primary/40 hover:text-primary dark:border-white/10 dark:bg-dark-surface dark:text-text-dark dark:hover:border-primary/50 dark:hover:text-sky"
    >
      {isDark ? <Sun size={18} strokeWidth={1.75} /> : <Moon size={18} strokeWidth={1.75} />}
    </button>
  );
}
