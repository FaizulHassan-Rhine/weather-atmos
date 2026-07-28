"use client";

import { AlertTriangle, Shirt } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/hooks/useI18n";
import { getWeatherTips } from "@/lib/weatherTips";
import AlertPreferences from "@/components/dashboard/AlertPreferences";

const SEVERITY = {
  high: "border-accent/50 bg-accent/15",
  medium: "border-secondary/40 bg-secondary/10 dark:bg-secondary/15",
};

export default function WeatherAlerts({ weather }) {
  const reduceMotion = useReducedMotion();
  const { t } = useI18n();
  const current = weather.current;
  const daily = weather.daily;

  const tips = getWeatherTips({
    code: current.weather_code,
    temperature: current.temperature_2m,
    apparentTemperature: current.apparent_temperature,
    windSpeed: current.wind_speed_10m,
    uvIndex: daily?.uv_index_max?.[0],
    precipProbability:
      weather.hourly?.precipitation_probability?.[0] ??
      daily?.precipitation_probability_max?.[0],
    isDay: Boolean(current.is_day),
    humidity: current.relative_humidity_2m,
  });

  const wearPreview = tips.wear
    .slice(0, 3)
    .map((item) => t(item))
    .join(" · ");

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="grid gap-4 lg:grid-cols-2"
      aria-label={t("Weather alerts")}
    >
      <div className="card-surface p-5 sm:p-6">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/25 text-accent">
            <AlertTriangle size={18} aria-hidden />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-text dark:text-text-dark">
              {t("Weather alerts")}
            </h2>
            <p className="text-sm text-muted-soft">
              {t("Based on current conditions")}
            </p>
          </div>
        </div>

        {tips.alerts.length === 0 ? (
          <p className="text-sm leading-relaxed text-muted-soft">
            {t("No notable alerts right now — conditions look manageable.")}
          </p>
        ) : (
          <ul className="space-y-2">
            {tips.alerts.map((alert) => (
              <li
                key={alert.title}
                className={`rounded-2xl border px-3 py-3 ${SEVERITY[alert.severity] || SEVERITY.medium}`}
              >
                <p className="text-sm font-semibold text-text dark:text-text-dark">
                  {t(alert.title)}
                </p>
                <p className="mt-0.5 text-sm text-muted-soft">
                  {t(alert.message)}
                </p>
              </li>
            ))}
          </ul>
        )}
        <AlertPreferences />
      </div>

      <div className="card-surface p-5 sm:p-6">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-mint/80 text-primary dark:bg-primary/20 dark:text-sky">
            <Shirt size={18} aria-hidden />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-text dark:text-text-dark">
              {t("What to wear")}
            </h2>
            <p className="text-sm text-muted-soft">
              {t("Practical outfit tips")}
            </p>
          </div>
        </div>
        <p className="mb-3 text-sm leading-relaxed text-text/85 dark:text-text-dark/85">
          {t("What to wear:")} {wearPreview}
        </p>
        <ul className="space-y-1.5">
          {tips.wear.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 text-sm text-muted-soft"
            >
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              {t(item)}
            </li>
          ))}
        </ul>
      </div>
    </motion.section>
  );
}
