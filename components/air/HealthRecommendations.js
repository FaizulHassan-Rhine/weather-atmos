"use client";

import { HeartPulse } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/hooks/useI18n";
import { getHealthRecommendations } from "@/lib/airHealth";
import { RISK_TONE_CLASSES } from "@/lib/earthquake";

export default function HealthRecommendations({ current }) {
  const reduceMotion = useReducedMotion();
  const { t } = useI18n();

  if (!current) return null;

  const advice = getHealthRecommendations({
    europeanAqi: current.european_aqi,
    pm25: current.pm2_5,
    ozone: current.ozone,
  });
  const toneClass = RISK_TONE_CLASSES[advice.tone] || RISK_TONE_CLASSES.muted;

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-surface p-5 sm:p-6"
      aria-label={t("Health recommendations")}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-mint/80 text-primary dark:bg-primary/20 dark:text-sky">
            <HeartPulse size={20} aria-hidden />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-text dark:text-text-dark">
              {t("Health recommendations")}
            </h2>
            <p className="text-sm text-muted-soft">{t(advice.detail)}</p>
          </div>
        </div>
        <span className={`rounded-full px-3 py-1.5 text-sm font-medium ${toneClass}`}>
          {t(advice.level)}
        </span>
      </div>

      <ul className="space-y-2">
        {advice.tips.map((tip) => (
          <li
            key={tip}
            className="flex gap-2 rounded-2xl border border-sky/20 bg-bg/50 px-3 py-3 text-sm leading-relaxed text-muted-soft dark:border-white/8 dark:bg-dark-bg/40"
          >
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            {t(tip)}
          </li>
        ))}
      </ul>
    </motion.section>
  );
}
