"use client";

import { motion, useReducedMotion } from "framer-motion";
import WeatherIcon from "@/components/ui/WeatherIcon";
import { useI18n } from "@/hooks/useI18n";
import { formatLocalDateTime } from "@/lib/date";
import { formatTemperature } from "@/lib/temperature";
import { getWeatherInfo, getWeatherMessage } from "@/lib/weatherCodes";

export default function CurrentWeather({ location, weather, unit }) {
  const reduceMotion = useReducedMotion();
  const { t } = useI18n();
  const current = weather.current;
  const daily = weather.daily;
  const timezone = weather.timezone;
  const isDay = Boolean(current.is_day);
  const info = getWeatherInfo(current.weather_code, isDay);
  const message = getWeatherMessage({
    code: current.weather_code,
    isDay,
    precipProbability: weather.hourly?.precipitation_probability?.[0],
    temperature: current.temperature_2m,
  });

  const high = daily?.temperature_2m_max?.[0];
  const low = daily?.temperature_2m_min?.[0];
  const subtitle = [location.admin1, location.country].filter(Boolean).join(", ");

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="card-surface relative overflow-hidden p-6 sm:p-8"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-mint/60 blur-3xl dark:bg-primary/20"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 left-10 h-48 w-48 rounded-full bg-sky/40 blur-3xl dark:bg-secondary/15"
      />

      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary dark:text-sky">
            {t("Current conditions")}
          </p>
          <h1 className="mt-2 truncate text-3xl font-semibold tracking-tight text-text dark:text-text-dark sm:text-4xl">
            {location.name}
            {location.country ? (
              <span className="text-muted-soft">, {location.country}</span>
            ) : null}
          </h1>
          {subtitle ? (
            <p className="mt-1 text-sm text-muted-soft">{subtitle}</p>
          ) : null}
          <p className="mt-2 text-sm text-muted-soft">
            {formatLocalDateTime(timezone)}
          </p>

          <div className="mt-6 flex flex-wrap items-end gap-3">
            <motion.p
              key={`${current.temperature_2m}-${unit}`}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-6xl font-semibold tracking-tight text-text dark:text-text-dark sm:text-7xl"
            >
              {formatTemperature(current.temperature_2m, unit, { withUnit: false })}
            </motion.p>
            <span className="mb-2 text-2xl font-medium text-muted-soft">
              {unit === "f" ? "°F" : "°C"}
            </span>
          </div>

          <p className="mt-2 text-base text-muted-soft">
            {t("Feels like")}{" "}
            <span className="font-medium text-text dark:text-text-dark">
              {formatTemperature(current.apparent_temperature, unit)}
            </span>
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-mint/80 px-3 py-1.5 text-sm font-medium text-primary dark:bg-primary/20 dark:text-sky">
              <WeatherIcon code={current.weather_code} isDay={isDay} size={16} label={false} />
              {t(info.label)}
            </span>
            <span className="text-sm text-muted-soft">
              H {formatTemperature(high, unit)} · L {formatTemperature(low, unit)}
            </span>
          </div>

          <p className="mt-5 max-w-md text-base leading-relaxed text-text/80 dark:text-text-dark/85">
            {t(message)}
          </p>
        </div>

        <motion.div
          animate={
            reduceMotion
              ? undefined
              : {
                  y: [0, -8, 0],
                }
          }
          transition={
            reduceMotion
              ? undefined
              : {
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
          }
          className="mx-auto flex h-36 w-36 items-center justify-center rounded-[2rem] bg-gradient-to-br from-mint to-sky/70 text-primary shadow-[var(--shadow-soft)] dark:from-primary/25 dark:to-secondary/20 dark:text-sky sm:h-40 sm:w-40 lg:mx-0"
        >
          <WeatherIcon
            code={current.weather_code}
            isDay={isDay}
            size={72}
            className="drop-shadow-sm"
          />
        </motion.div>
      </div>
    </motion.section>
  );
}
