"use client";

import { CloudRain } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/hooks/useI18n";
import { getRainOutlook } from "@/lib/precip";
import { formatPercent } from "@/lib/temperature";

export default function RainOutlook({ weather }) {
  const reduceMotion = useReducedMotion();
  const { t } = useI18n();
  const rain = getRainOutlook(weather);

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card-surface space-y-4 p-5 sm:p-6"
      aria-label={t("Rain outlook")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-text dark:text-text-dark">{t("Rain outlook")}</h2>
          <p className="text-sm text-muted-soft">{t("Precipitation chance and expected amount")}</p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/15 text-secondary dark:bg-secondary/20 dark:text-sky">
          <CloudRain size={18} aria-hidden />
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-sky/20 bg-bg/50 p-3 dark:border-white/8 dark:bg-dark-bg/40">
          <p className="text-xs text-muted-soft">{t("Current rain chance")}</p>
          <p className="mt-1 text-xl font-semibold text-text dark:text-text-dark">
            {formatPercent(rain.currentProbability)}
          </p>
        </div>
        <div className="rounded-2xl border border-sky/20 bg-bg/50 p-3 dark:border-white/8 dark:bg-dark-bg/40">
          <p className="text-xs text-muted-soft">{t("Next rain")}</p>
          <p className="mt-1 text-base font-semibold text-text dark:text-text-dark">
            {rain.nextRainIsTime ? rain.nextRainLabel : t(rain.nextRainLabel)}
          </p>
        </div>
        <div className="rounded-2xl border border-sky/20 bg-bg/50 p-3 dark:border-white/8 dark:bg-dark-bg/40">
          <p className="text-xs text-muted-soft">{t("Expected amount (12h)")}</p>
          <p className="mt-1 text-base font-semibold text-text dark:text-text-dark">
            {rain.expectedAmount == null ? "—" : `${rain.expectedAmount.toFixed(1)} mm`}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-muted-soft">{t("Next 12 hours rain chance")}</p>
        <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-12">
          {rain.hourlyWindow.map((slot) => (
            <div key={slot.time} className="space-y-1 text-center">
              <div className="h-14 rounded-lg bg-mint/60 p-1 dark:bg-white/8">
                <div
                  className="mx-auto h-full w-2 rounded-full bg-primary/25"
                  title={`${slot.label}: ${Math.round(slot.chance)}%`}
                >
                  <div
                    className="w-2 rounded-full bg-primary"
                    style={{
                      height: `${Math.max(6, slot.chance)}%`,
                      transform: `translateY(${100 - Math.max(6, slot.chance)}%)`,
                    }}
                  />
                </div>
              </div>
              <p className="truncate text-[10px] text-muted-soft">{slot.label}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
