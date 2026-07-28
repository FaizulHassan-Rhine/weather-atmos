"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import WeatherIcon from "@/components/ui/WeatherIcon";
import { useI18n } from "@/hooks/useI18n";
import { formatDayName, formatSunTime } from "@/lib/date";
import { formatPercent, formatTemperature, formatWindSpeed } from "@/lib/temperature";
import { getWeatherInfo } from "@/lib/weatherCodes";

export default function WeeklyForecast({ weather, unit }) {
  const reduceMotion = useReducedMotion();
  const { t } = useI18n();
  const [openDay, setOpenDay] = useState(0);
  const daily = weather.daily;
  const hourly = weather.hourly;
  const timezone = weather.timezone;

  const humidityByDay = useMemo(() => {
    const map = new Map();
    const times = hourly.time ?? [];
    const humidity = hourly.relative_humidity_2m ?? [];
    times.forEach((time, index) => {
      const key = time.split("T")[0];
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(humidity[index]);
    });
    return map;
  }, [hourly]);

  const days = daily.time.slice(0, 7).map((time, index) => {
    const code = daily.weather_code[index];
    const info = getWeatherInfo(code, true);
    const key = time.split("T")[0];
    const humidityList = humidityByDay.get(key) ?? [];
    const humidityAvg = humidityList.length
      ? humidityList.reduce((sum, value) => sum + (value ?? 0), 0) / humidityList.length
      : null;
    return {
      index,
      time,
      code,
      label: info.label,
      min: daily.temperature_2m_min[index],
      max: daily.temperature_2m_max[index],
      precip: daily.precipitation_probability_max[index],
      precipAmount: daily.precipitation_sum?.[index],
      sunrise: daily.sunrise?.[index],
      sunset: daily.sunset?.[index],
      uvMax: daily.uv_index_max?.[index],
      windMax: daily.wind_speed_10m_max?.[index],
      humidityAvg,
      isToday: index === 0,
    };
  });

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className="card-surface p-5 sm:p-6"
      aria-label={t("7-day forecast")}
    >
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-text dark:text-text-dark">
          {t("7-day forecast")}
        </h2>
        <p className="text-sm text-muted-soft">{t("Weekly outlook")}</p>
      </div>

      <div className="space-y-2">
        {days.map((day, index) => (
          <motion.div
            key={day.time}
            initial={reduceMotion ? false : { opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.25,
              delay: reduceMotion ? 0 : 0.04 * index,
            }}
            className="overflow-hidden rounded-2xl border border-sky/20 bg-bg/50 dark:border-white/8 dark:bg-dark-bg/40"
          >
            <button
              type="button"
              aria-expanded={openDay === day.index}
              onClick={() => setOpenDay((prev) => (prev === day.index ? -1 : day.index))}
              className="flex w-full items-center gap-3 px-3 py-3 text-left transition hover:bg-mint/20 dark:hover:bg-white/5"
            >
              <div className="w-16 shrink-0">
                <p className="text-sm font-semibold text-text dark:text-text-dark">
                  {day.isToday ? t("Today") : formatDayName(day.time, timezone, { short: true })}
                </p>
              </div>
              <WeatherIcon
                code={day.code}
                size={22}
                className="shrink-0 text-primary dark:text-sky"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-muted-soft">{t(day.label)}</p>
                <p className="text-xs text-secondary dark:text-sky/80">
                  {formatPercent(day.precip)} {t("Rain")}
                </p>
              </div>
              <div className="text-right text-sm">
                <span className="font-semibold text-text dark:text-text-dark">
                  {formatTemperature(day.max, unit, { withUnit: false })}
                </span>
                <span className="mx-1 text-muted-soft">/</span>
                <span className="text-muted-soft">
                  {formatTemperature(day.min, unit, { withUnit: false })}
                </span>
              </div>
              <ChevronDown
                size={16}
                className={`shrink-0 text-muted transition-transform ${
                  openDay === day.index ? "rotate-180" : ""
                }`}
                aria-hidden
              />
            </button>
            {openDay === day.index ? (
              <div className="grid grid-cols-2 gap-2 border-t border-sky/20 bg-surface/70 px-3 py-3 text-xs dark:border-white/8 dark:bg-dark-surface/60 sm:grid-cols-3">
                <p className="text-muted-soft">
                  {t("Sunrise")}:{" "}
                  <span className="text-text dark:text-text-dark">
                    {formatSunTime(day.sunrise, timezone)}
                  </span>
                </p>
                <p className="text-muted-soft">
                  {t("Sunset")}:{" "}
                  <span className="text-text dark:text-text-dark">
                    {formatSunTime(day.sunset, timezone)}
                  </span>
                </p>
                <p className="text-muted-soft">
                  {t("Humidity")}:{" "}
                  <span className="text-text dark:text-text-dark">
                    {formatPercent(day.humidityAvg)}
                  </span>
                </p>
                <p className="text-muted-soft">
                  {t("Wind")}:{" "}
                  <span className="text-text dark:text-text-dark">
                    {formatWindSpeed(day.windMax, unit)}
                  </span>
                </p>
                <p className="text-muted-soft">
                  {t("UV index")}:{" "}
                  <span className="text-text dark:text-text-dark">
                    {day.uvMax == null ? "—" : (Math.round(day.uvMax * 10) / 10).toFixed(1)}
                  </span>
                </p>
                <p className="text-muted-soft">
                  {t("Precipitation")}:{" "}
                  <span className="text-text dark:text-text-dark">
                    {day.precipAmount == null ? "—" : `${day.precipAmount.toFixed(1)} mm`}
                  </span>
                </p>
              </div>
            ) : null}
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
