"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import WeatherIcon from "@/components/ui/WeatherIcon";
import { useI18n } from "@/hooks/useI18n";
import { findCurrentHourIndex, formatHourLabel } from "@/lib/date";
import { formatPercent, formatTemperature, formatWindSpeed } from "@/lib/temperature";

export default function HourlyForecast({ weather, unit }) {
  const reduceMotion = useReducedMotion();
  const { t } = useI18n();
  const scrollRef = useRef(null);
  const [range, setRange] = useState(24);
  const hourly = weather.hourly;
  const timezone = weather.timezone;
  const currentIndex = findCurrentHourIndex(hourly.time, timezone);

  const slots = useMemo(() => {
    const start = Math.max(0, currentIndex);
    const end = Math.min(hourly.time.length, start + range);
    return hourly.time.slice(start, end).map((time, offset) => {
      const index = start + offset;
      return {
        time,
        temperature: hourly.temperature_2m[index],
        precip: hourly.precipitation_probability[index],
        windSpeed: hourly.wind_speed_10m?.[index],
        code: hourly.weather_code[index],
        isDay: Boolean(hourly.is_day?.[index] ?? 1),
        isCurrent: index === currentIndex,
      };
    });
  }, [hourly, currentIndex, range]);

  useEffect(() => {
    if (!scrollRef.current) return;
    const currentEl = scrollRef.current.querySelector("[data-current='true']");
    if (currentEl) {
      currentEl.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [slots, reduceMotion]);

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.08 }}
      className="card-surface p-5 sm:p-6"
      aria-label={t("Hourly forecast")}
    >
      <div className="mb-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-text dark:text-text-dark">
              {t("Hourly forecast")}
            </h2>
            <p className="text-sm text-muted-soft">
              {range === 24 ? t("Next 24 hours") : t("Next 48 hours")}
            </p>
          </div>
          <div
            role="group"
            aria-label={t("Hourly range")}
            className="inline-flex rounded-full border border-sky/40 bg-bg/70 p-1 dark:border-white/10 dark:bg-dark-bg/60"
          >
            <button
              type="button"
              aria-pressed={range === 24}
              onClick={() => setRange(24)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                range === 24
                  ? "bg-primary text-white"
                  : "text-muted hover:text-text dark:hover:text-text-dark"
              }`}
            >
              24h
            </button>
            <button
              type="button"
              aria-pressed={range === 48}
              onClick={() => setRange(48)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                range === 48
                  ? "bg-primary text-white"
                  : "text-muted hover:text-text dark:hover:text-text-dark"
              }`}
            >
              48h
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="scrollbar-thin -mx-1 flex gap-3 overflow-x-auto px-1 pb-2"
      >
        {slots.map((slot, index) => (
          <motion.div
            key={slot.time}
            data-current={slot.isCurrent}
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.25,
              delay: reduceMotion ? 0 : 0.03 * index,
            }}
            whileHover={reduceMotion ? undefined : { y: -3 }}
            className={`flex min-w-[4.75rem] flex-col items-center gap-2 rounded-2xl border px-3 py-3 ${
              slot.isCurrent
                ? "border-primary/50 bg-primary/10 dark:border-primary/40 dark:bg-primary/20"
                : "border-sky/25 bg-bg/60 dark:border-white/8 dark:bg-dark-bg/50"
            }`}
          >
            <span className="text-xs font-medium text-muted-soft">
              {slot.isCurrent ? t("Now") : formatHourLabel(slot.time, timezone)}
            </span>
            <WeatherIcon
              code={slot.code}
              isDay={slot.isDay}
              size={22}
              className="text-primary dark:text-sky"
            />
            <span className="text-sm font-semibold text-text dark:text-text-dark">
              {formatTemperature(slot.temperature, unit, { withUnit: false })}
            </span>
            <span className="text-[11px] text-secondary dark:text-sky/80">
              {formatPercent(slot.precip)}
            </span>
            <span className="text-[11px] text-muted-soft">
              {formatWindSpeed(slot.windSpeed, unit)}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
