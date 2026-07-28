"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/hooks/useI18n";
import { getAqiInfo } from "@/lib/airQuality";
import { getAirQuality } from "@/lib/openMeteo";
import { RISK_TONE_CLASSES } from "@/lib/earthquake";

export default function AirComparison({ favorites, onSelect }) {
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
            const air = await getAirQuality(city, controller.signal);
            return { city, air };
          })
        );
        if (!cancelled) {
          setRows(results);
          setLoading(false);
        }
      } catch (err) {
        if (err.name === "AbortError" || cancelled) return;
        setError(err.message || "Unable to compare air quality.");
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
          {t("Save at least two favorite cities to compare air quality.")}
        </p>
      </section>
    );
  }

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-surface p-5 sm:p-6"
      aria-label={t("Compare cities")}
    >
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-text dark:text-text-dark">
          {t("Compare cities")}
        </h2>
        <p className="text-sm text-muted-soft">
          {t("Side-by-side AQI for up to three favorites")}
        </p>
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cities.map((city) => (
            <div
              key={city.id || `${city.latitude}-${city.longitude}`}
              className="h-32 animate-pulse rounded-2xl bg-sky/20 dark:bg-white/8"
            />
          ))}
        </div>
      ) : null}

      {error ? (
        <p className="text-sm text-accent" role="alert">
          {t(error)}
        </p>
      ) : null}

      {!loading && !error && rows.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map(({ city, air }) => {
            const current = air.current || {};
            const aqi = getAqiInfo(current.european_aqi);
            const toneClass =
              RISK_TONE_CLASSES[aqi.tone] || RISK_TONE_CLASSES.muted;

            return (
              <button
                key={city.id || `${city.latitude}-${city.longitude}`}
                type="button"
                onClick={() => onSelect?.(city)}
                className="rounded-2xl border border-sky/25 bg-bg/60 p-4 text-left transition hover:-translate-y-0.5 hover:border-primary/40 dark:border-white/8 dark:bg-dark-bg/50"
              >
                <p className="truncate text-sm font-semibold text-text dark:text-text-dark">
                  {city.name}
                </p>
                <p className="truncate text-xs text-muted-soft">
                  {[city.admin1, city.country].filter(Boolean).join(", ")}
                </p>
                <div className="mt-4 flex items-end justify-between gap-2">
                  <div>
                    <p className="text-3xl font-semibold text-text dark:text-text-dark">
                      {current.european_aqi != null
                        ? Math.round(current.european_aqi)
                        : "—"}
                    </p>
                    <p className="text-xs text-muted-soft">{t("European AQI")}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${toneClass}`}>
                    {t(aqi.level)}
                  </span>
                </div>
                <p className="mt-3 text-xs text-muted-soft">
                  PM2.5{" "}
                  {current.pm2_5 != null
                    ? `${Number(current.pm2_5).toFixed(1)} µg/m³`
                    : "—"}
                </p>
              </button>
            );
          })}
        </div>
      ) : null}
    </motion.section>
  );
}
