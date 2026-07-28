"use client";

import { ShieldAlert, Sun } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/hooks/useI18n";
import { getUvPeakWindow, getUvRisk } from "@/lib/uv";

export default function UvIndexCard({ weather }) {
  const reduceMotion = useReducedMotion();
  const { t } = useI18n();
  const dailyMax = weather.daily?.uv_index_max?.[0];
  const currentUv = weather.hourly?.uv_index?.[0] ?? dailyMax;
  const risk = getUvRisk(currentUv);
  const peak = getUvPeakWindow(weather.hourly, weather.timezone);

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card-surface space-y-4 p-5 sm:p-6"
      aria-label={t("UV insights")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-text dark:text-text-dark">
            {t("UV insights")}
          </h2>
          <p className="text-sm text-muted-soft">{t("Sun safety and exposure guidance")}</p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20 text-accent dark:bg-accent/15">
          <Sun size={18} aria-hidden />
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-sky/20 bg-bg/50 p-3 dark:border-white/8 dark:bg-dark-bg/40">
          <p className="text-xs text-muted-soft">{t("Current UV")}</p>
          <p className="mt-1 text-xl font-semibold text-text dark:text-text-dark">
            {risk.value == null ? "—" : risk.value}
          </p>
        </div>
        <div className="rounded-2xl border border-sky/20 bg-bg/50 p-3 dark:border-white/8 dark:bg-dark-bg/40">
          <p className="text-xs text-muted-soft">{t("Risk level")}</p>
          <p className="mt-1 text-base font-semibold text-text dark:text-text-dark">{t(risk.level)}</p>
        </div>
        <div className="rounded-2xl border border-sky/20 bg-bg/50 p-3 dark:border-white/8 dark:bg-dark-bg/40">
          <p className="text-xs text-muted-soft">{t("Suggested safe time")}</p>
          <p className="mt-1 text-base font-semibold text-text dark:text-text-dark">
            {risk.safeMinutes == null ? "—" : `${risk.safeMinutes} ${t("minutes")}`}
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-sky/20 bg-surface/70 p-3 dark:border-white/8 dark:bg-dark-surface/60">
        <ShieldAlert className="mt-0.5 shrink-0 text-accent" size={17} aria-hidden />
        <p className="text-sm text-text/85 dark:text-text-dark/85">{t(risk.advice)}</p>
      </div>

      <p className="text-sm text-muted-soft">
        {t("Peak UV window")}:{" "}
        <span className="font-medium text-text dark:text-text-dark">
          {peak ? `${peak.from} - ${peak.to}` : "—"}
        </span>
      </p>
    </motion.section>
  );
}
