"use client";

import { Clock3, Leaf } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import { getAqiInfo } from "@/lib/airQuality";

function formatHour(iso, timezone) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: timezone || undefined,
    }).format(new Date(iso));
  } catch {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(iso));
  }
}

function computeBestWindow(data) {
  const hourly = data?.hourly;
  const times = hourly?.time ?? [];
  const aqi = hourly?.european_aqi ?? [];
  if (!times.length || !aqi.length) return null;

  let best = null;
  const horizon = Math.min(times.length, 24);
  for (let i = 0; i < horizon; i += 1) {
    const value = aqi[i];
    if (value == null || Number.isNaN(value)) continue;
    if (!best || value < best.value) {
      best = { index: i, value };
    }
  }
  if (!best) return null;

  return {
    from: times[best.index],
    to: times[Math.min(best.index + 2, times.length - 1)],
    value: best.value,
  };
}

export default function BestOutdoorTime({ data }) {
  const { t } = useI18n();
  const timezone = data?.timezone;
  const best = computeBestWindow(data);

  return (
    <section className="card-surface p-5 sm:p-6" aria-label={t("Best time to go outside")}>
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-mint/80 text-primary dark:bg-primary/20 dark:text-sky">
          <Clock3 size={17} aria-hidden />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-text dark:text-text-dark">
            {t("Best time to go outside")}
          </h2>
          <p className="text-sm text-muted-soft">{t("Based on the next 24 hours AQI")}</p>
        </div>
      </div>

      {best ? (
        <div className="rounded-2xl border border-sky/25 bg-bg/60 p-4 dark:border-white/8 dark:bg-dark-bg/45">
          <p className="text-sm text-muted-soft">
            {t("Suggested window")}:{" "}
            <span className="font-semibold text-text dark:text-text-dark">
              {formatHour(best.from, timezone)} - {formatHour(best.to, timezone)}
            </span>
          </p>
          <p className="mt-2 inline-flex items-center gap-2 text-sm text-text dark:text-text-dark">
            <Leaf size={14} aria-hidden />
            {t("Expected air quality")}: {t(getAqiInfo(best.value).level)}
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted-soft">{t("No hourly pollution data available.")}</p>
      )}
    </section>
  );
}
