"use client";

import { MoonStar } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/hooks/useI18n";
import { getMoonMessage, getMoonPhase } from "@/lib/moon";
import { getWeatherMessage } from "@/lib/weatherCodes";

export default function MoonPhaseCard({ weather }) {
  const reduceMotion = useReducedMotion();
  const { t } = useI18n();
  const current = weather.current;
  const isDay = Boolean(current.is_day);
  const moon = getMoonPhase(new Date());
  const nightMessage = getMoonMessage(moon, isDay);

  const dayMessage = getWeatherMessage({
    code: current.weather_code,
    isDay,
    precipProbability: weather.hourly?.precipitation_probability?.[0],
    temperature: current.temperature_2m,
  });

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-surface flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
      aria-label={t("Moon phase")}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary/15 text-secondary dark:bg-secondary/20 dark:text-sky">
          <MoonStar size={22} aria-hidden />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-text dark:text-text-dark">
            {t(moon.label)}
          </h2>
          <p className="mt-1 text-sm text-muted-soft">
            {t("Illumination")} {moon.illuminationPercent}%
          </p>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-text/85 dark:text-text-dark/85">
            {isDay ? `${t(dayMessage)} ${t(nightMessage)}` : t(nightMessage)}
          </p>
        </div>
      </div>

      <div
        aria-hidden
        className="relative mx-auto h-20 w-20 shrink-0 rounded-full bg-gradient-to-br from-sky/40 to-secondary/30 shadow-inner dark:from-sky/20 dark:to-dark-bg sm:mx-0"
      >
        <div
          className="absolute inset-0 rounded-full bg-text-dark/90 dark:bg-text-dark"
          style={{
            clipPath:
              moon.fraction < 0.5
                ? `inset(0 ${100 - moon.illuminationPercent}% 0 0)`
                : `inset(0 0 0 ${100 - moon.illuminationPercent}%)`,
            opacity: 0.85,
          }}
        />
      </div>
    </motion.section>
  );
}
