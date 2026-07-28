"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import WeatherIcon from "@/components/ui/WeatherIcon";
import { useI18n } from "@/hooks/useI18n";
import { getWeather } from "@/lib/openMeteo";
import { formatTemperature } from "@/lib/temperature";
import { getWeatherInfo } from "@/lib/weatherCodes";

export default function CompareCities({ favorites, unit, onSelect }) {
  const reduceMotion = useReducedMotion();
  const { t } = useI18n();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cities = useMemo(() => favorites.slice(0, 3), [favorites]);
  const citiesKey = useMemo(
    () => cities.map((c) => `${c.latitude},${c.longitude}`).join("|"),
    [cities]
  );

  useEffect(() => {
    if (cities.length < 2) {
      setRows([]);
      setError(null);
      setLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    let cancelled = false;
    const snapshot = cities;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const results = await Promise.all(
          snapshot.map(async (city) => {
            const weather = await getWeather(city, controller.signal);
            return { city, weather };
          })
        );
        if (!cancelled) {
          setRows(results);
          setLoading(false);
        }
      } catch (err) {
        if (err.name === "AbortError" || cancelled) return;
        setError(err.message || "Unable to compare cities.");
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [cities, citiesKey]);

  if (favorites.length < 2) {
    return (
      <section className="card-surface p-5 sm:p-6" aria-label={t("Compare cities")}>
        <h2 className="text-lg font-semibold text-text dark:text-text-dark">
          {t("Compare cities")}
        </h2>
        <p className="mt-1 text-sm text-muted-soft">
          {t("Save at least two favorite cities to compare them side by side.")}
        </p>
      </section>
    );
  }

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="card-surface p-5 sm:p-6"
      aria-label={t("Compare cities")}
    >
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-text dark:text-text-dark">
          {t("Compare cities")}
        </h2>
        <p className="text-sm text-muted-soft">
          {t("Side-by-side look at up to three favorites")}
        </p>
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cities.map((city) => (
            <div
              key={city.id || `${city.latitude}-${city.longitude}`}
              className="h-36 animate-pulse rounded-2xl bg-sky/20 dark:bg-white/8"
            />
          ))}
        </div>
      ) : null}

      {error ? (
        <p className="text-sm text-accent" role="alert">
          {error}
        </p>
      ) : null}

      {!loading && !error && rows.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map(({ city, weather }) => {
            const current = weather.current;
            const info = getWeatherInfo(
              current.weather_code,
              Boolean(current.is_day)
            );
            return (
              <button
                key={city.id || `${city.latitude}-${city.longitude}`}
                type="button"
                onClick={() => onSelect?.(city)}
                className="rounded-2xl border border-sky/25 bg-bg/60 p-4 text-left transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-card)] dark:border-white/8 dark:bg-dark-bg/50"
              >
                <p className="truncate text-sm font-semibold text-text dark:text-text-dark">
                  {city.name}
                </p>
                <p className="truncate text-xs text-muted-soft">
                  {[city.admin1, city.country].filter(Boolean).join(", ")}
                </p>
                <div className="mt-4 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-3xl font-semibold text-text dark:text-text-dark">
                      {formatTemperature(current.temperature_2m, unit, {
                        withUnit: false,
                      })}
                      <span className="ml-1 text-base text-muted-soft">
                        {unit === "f" ? "°F" : "°C"}
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-muted-soft">{t(info.label)}</p>
                  </div>
                  <WeatherIcon
                    code={current.weather_code}
                    isDay={Boolean(current.is_day)}
                    size={36}
                    className="text-primary dark:text-sky"
                  />
                </div>
                <p className="mt-3 text-xs text-muted-soft">
                  Feels {formatTemperature(current.apparent_temperature, unit)} ·{" "}
                  Humidity {Math.round(current.relative_humidity_2m)}%
                </p>
              </button>
            );
          })}
        </div>
      ) : null}
    </motion.section>
  );
}
