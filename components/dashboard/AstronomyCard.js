"use client";

import { MoonStar } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/hooks/useI18n";
import { formatSunTime } from "@/lib/date";
import { getMoonMessage, getMoonPhase, getMoonTimes, getNextMajorMoonDates } from "@/lib/moon";
import { estimateCivilTwilight, formatDuration, getDaylightProgress } from "@/lib/sun";
import { getWeatherMessage } from "@/lib/weatherCodes";

function formatCalendarDate(iso, timezone) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      timeZone: timezone || undefined,
    }).format(new Date(iso));
  } catch {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(new Date(iso));
  }
}

export default function AstronomyCard({ weather, location }) {
  const reduceMotion = useReducedMotion();
  const { t } = useI18n();
  const current = weather.current;
  const daily = weather.daily;
  const timezone = weather.timezone;
  const sunrise = daily?.sunrise?.[0];
  const sunset = daily?.sunset?.[0];
  const daylight = formatDuration(daily?.daylight_duration?.[0]);
  const moon = getMoonPhase(new Date());
  const isDay = Boolean(current.is_day);
  const nightMessage = getMoonMessage(moon, isDay);
  const dayMessage = getWeatherMessage({
    code: current.weather_code,
    isDay,
    precipProbability: weather.hourly?.precipitation_probability?.[0],
    temperature: current.temperature_2m,
  });
  const progress = getDaylightProgress({ sunrise, sunset });
  const civil = estimateCivilTwilight({
    sunrise,
    sunset,
    latitude: location?.latitude,
  });
  const moonTimes = getMoonTimes({ sunrise, sunset });
  const moonDates = getNextMajorMoonDates(new Date());

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card-surface space-y-5 p-5 sm:p-6"
      aria-label={t("Astronomy")}
    >
      <div>
        <h2 className="text-lg font-semibold text-text dark:text-text-dark">
          {t("Astronomy")}
        </h2>
        <p className="text-sm text-muted-soft">{t("Sun and moon details")}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-sky/20 bg-bg/50 p-3 dark:border-white/8 dark:bg-dark-bg/40">
          <p className="text-xs text-muted-soft">{t("Sunrise")}</p>
          <p className="mt-1 text-sm font-semibold text-text dark:text-text-dark">
            {formatSunTime(sunrise, timezone)}
          </p>
        </div>
        <div className="rounded-2xl border border-sky/20 bg-bg/50 p-3 dark:border-white/8 dark:bg-dark-bg/40">
          <p className="text-xs text-muted-soft">{t("Sunset")}</p>
          <p className="mt-1 text-sm font-semibold text-text dark:text-text-dark">
            {formatSunTime(sunset, timezone)}
          </p>
        </div>
        <div className="rounded-2xl border border-sky/20 bg-bg/50 p-3 dark:border-white/8 dark:bg-dark-bg/40">
          <p className="text-xs text-muted-soft">{t("Day length")}</p>
          <p className="mt-1 text-sm font-semibold text-text dark:text-text-dark">{daylight}</p>
        </div>
        <div className="rounded-2xl border border-sky/20 bg-bg/50 p-3 dark:border-white/8 dark:bg-dark-bg/40">
          <p className="text-xs text-muted-soft">{t("Moon illumination")}</p>
          <p className="mt-1 text-sm font-semibold text-text dark:text-text-dark">
            {moon.illuminationPercent}%
          </p>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between text-xs text-muted-soft">
          <span>{t("Daylight progress")}</span>
          <span>{Math.round(progress.percent)}%</span>
        </div>
        <div className="h-2 rounded-full bg-mint/70 dark:bg-white/10">
          <div
            className="h-2 rounded-full bg-primary transition-[width] duration-500"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
      </div>

      <div className="grid gap-3 text-sm text-muted-soft sm:grid-cols-2 lg:grid-cols-3">
        <p>
          {t("Civil dawn")}:{" "}
          <span className="font-medium text-text dark:text-text-dark">
            {formatSunTime(civil.dawn, timezone)}
          </span>
        </p>
        <p>
          {t("Civil dusk")}:{" "}
          <span className="font-medium text-text dark:text-text-dark">
            {formatSunTime(civil.dusk, timezone)}
          </span>
        </p>
        <p>
          {t("Moonrise")}:{" "}
          <span className="font-medium text-text dark:text-text-dark">
            {formatSunTime(moonTimes.moonrise, timezone)}
          </span>
        </p>
        <p>
          {t("Moonset")}:{" "}
          <span className="font-medium text-text dark:text-text-dark">
            {formatSunTime(moonTimes.moonset, timezone)}
          </span>
        </p>
        <p>
          {t("Next full moon")}:{" "}
          <span className="font-medium text-text dark:text-text-dark">
            {formatCalendarDate(moonDates.nextFullMoon, timezone)}
          </span>
        </p>
        <p>
          {t("Next new moon")}:{" "}
          <span className="font-medium text-text dark:text-text-dark">
            {formatCalendarDate(moonDates.nextNewMoon, timezone)}
          </span>
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-sky/20 bg-surface/70 p-3 dark:border-white/8 dark:bg-dark-surface/60">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary/15 text-secondary dark:bg-secondary/20 dark:text-sky">
          <MoonStar size={18} aria-hidden />
        </span>
        <p className="text-sm leading-relaxed text-text/85 dark:text-text-dark/85">
          {isDay ? `${t(dayMessage)} ${t(nightMessage)}` : t(nightMessage)}
        </p>
      </div>
    </motion.section>
  );
}
