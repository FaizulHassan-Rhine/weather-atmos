"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Leaf, Wind } from "lucide-react";
import MetricCard from "@/components/ui/MetricCard";
import { useI18n } from "@/hooks/useI18n";
import { formatPollutant, getAqiInfo } from "@/lib/airQuality";

const TONE_CLASSES = {
  good: "bg-primary/15 text-primary dark:bg-primary/25 dark:text-sky",
  fair: "bg-secondary/15 text-secondary dark:bg-secondary/25 dark:text-sky",
  moderate: "bg-accent/25 text-[#9a6b3a] dark:text-accent",
  poor: "bg-accent/35 text-[#8a5528] dark:text-accent",
  "very-poor": "bg-red-500/15 text-red-700 dark:text-red-300",
  extreme: "bg-red-600/20 text-red-800 dark:text-red-200",
  muted: "bg-sky/20 text-muted",
};

export default function AirQualitySection({ data, loading, error, onRetry }) {
  const reduceMotion = useReducedMotion();
  const { t } = useI18n();

  if (loading && !data) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="card-surface h-28 animate-pulse bg-sky/15 dark:bg-white/5"
          />
        ))}
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="card-surface flex flex-wrap items-center justify-between gap-3 p-5">
        <p className="text-sm text-muted-soft">{t(error)}</p>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-xl bg-primary px-3 py-2 text-sm font-medium text-white"
          >
            {t("Retry air quality")}
          </button>
        ) : null}
      </div>
    );
  }

  if (!data?.current) return null;

  const current = data.current;
  const aqi = getAqiInfo(current.european_aqi);
  const toneClass = TONE_CLASSES[aqi.tone] || TONE_CLASSES.muted;

  return (
    <section aria-label={t("Air quality")}>
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 flex flex-wrap items-end justify-between gap-3"
      >
        <div>
          <h2 className="text-lg font-semibold text-text dark:text-text-dark">
            {t("Air quality")}
          </h2>
          <p className="text-sm text-muted-soft">
            {t("Live AQI, particles, and ozone")}
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${toneClass}`}
        >
          <Leaf size={14} aria-hidden />
          EAQI {Math.round(current.european_aqi ?? 0)} · {t(aqi.level)}
        </span>
      </motion.div>

      <p className="mb-4 text-sm text-muted-soft">{t(aqi.detail)}</p>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <MetricCard
          icon={Leaf}
          label={t("European AQI")}
          value={current.european_aqi != null ? Math.round(current.european_aqi) : "—"}
          detail={t(aqi.level)}
        />
        <MetricCard
          icon={Leaf}
          label={t("US AQI")}
          value={current.us_aqi != null ? Math.round(current.us_aqi) : "—"}
          detail={t("US scale")}
        />
        <MetricCard
          icon={Wind}
          label="PM2.5"
          value={formatPollutant(current.pm2_5, "µg/m³", 1)}
          detail={t("Fine particles")}
        />
        <MetricCard
          icon={Wind}
          label={t("Ozone")}
          value={formatPollutant(current.ozone, "µg/m³", 0)}
          detail={t("O₃ concentration")}
        />
      </div>
    </section>
  );
}
