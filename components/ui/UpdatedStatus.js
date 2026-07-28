"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";

export default function UpdatedStatus({ updatedAt, onRefresh, refreshing }) {
  const { t } = useI18n();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(id);
  }, []);

  let statusText = t("Waiting for data…");
  if (updatedAt) {
    const seconds = Math.max(0, Math.floor((now - updatedAt) / 1000));
    if (seconds < 20) statusText = t("Updated just now");
    else if (seconds < 60) statusText = t(`Updated ${seconds}s ago`);
    else {
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) statusText = t(`Updated ${minutes}m ago`);
      else statusText = t(`Updated ${Math.floor(minutes / 60)}h ago`);
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-soft">
      <p role="status">{statusText}</p>
      {onRefresh ? (
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 transition hover:bg-sky/20 hover:text-primary disabled:opacity-60 dark:hover:bg-white/10"
        >
          <RefreshCw
            size={12}
            className={refreshing ? "animate-spin" : ""}
            aria-hidden
          />
          {t("Refresh")}
        </button>
      ) : null}
    </div>
  );
}
