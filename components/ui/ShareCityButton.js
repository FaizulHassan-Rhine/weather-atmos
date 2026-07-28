"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import { buildShareUrl } from "@/lib/share";

export default function ShareCityButton({ city }) {
  const [copied, setCopied] = useState(false);
  const { t } = useI18n();

  async function handleShare() {
    if (!city || typeof window === "undefined") return;
    const url = buildShareUrl(city, window.location.origin);

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        window.prompt(t("Copy shareable city link"), url);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt(t("Copy shareable city link"), url);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={!city}
      aria-label={t("Copy shareable city link")}
      className="inline-flex h-10 items-center gap-2 rounded-xl border border-sky/40 bg-surface px-3 text-sm font-medium text-text transition hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-dark-surface dark:text-text-dark dark:hover:text-sky"
    >
      {copied ? <Check size={16} aria-hidden /> : <Link2 size={16} aria-hidden />}
      <span className="hidden sm:inline">{copied ? t("Copied") : t("Share")}</span>
    </button>
  );
}
