"use client";

import { Clock3, Trash2, X } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";

export default function RecentSearches({
  items = [],
  onSelect,
  onRemove,
  onClear,
}) {
  const { t } = useI18n();

  if (!items.length) return null;

  return (
    <div className="mt-2 rounded-xl border border-sky/25 bg-surface px-3 py-2 dark:border-white/8 dark:bg-dark-surface">
      <div className="mb-2 flex items-center justify-between">
        <p className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-soft">
          <Clock3 size={13} aria-hidden />
          {t("Recent searches")}
        </p>
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1 text-xs text-muted-soft transition hover:text-primary"
        >
          <Trash2 size={12} aria-hidden />
          {t("Clear")}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((city) => (
          <div
            key={city.id}
            className="inline-flex items-center gap-1 rounded-full border border-sky/25 bg-bg/70 px-2.5 py-1 text-xs text-text dark:border-white/10 dark:bg-dark-bg/60 dark:text-text-dark"
          >
            <button
              type="button"
              onClick={() => onSelect?.(city)}
              className="max-w-[10rem] truncate"
              title={`${city.name}${city.country ? `, ${city.country}` : ""}`}
            >
              {city.name}
            </button>
            <button
              type="button"
              onClick={() => onRemove?.(city.id)}
              className="rounded-full p-0.5 text-muted-soft transition hover:text-primary"
              aria-label={t("Remove recent search")}
            >
              <X size={12} aria-hidden />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
