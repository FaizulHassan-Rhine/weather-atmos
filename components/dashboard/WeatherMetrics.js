"use client";

import {
  Compass,
  Cloud,
  Droplets,
  Eye,
  Gauge,
  ThermometerSun,
  Umbrella,
  Wind,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import MetricCard from "@/components/ui/MetricCard";
import { useI18n } from "@/hooks/useI18n";
import {
  formatPercent,
  formatPressure,
  formatTemperature,
  formatUvIndex,
  formatVisibility,
  formatWindSpeed,
} from "@/lib/temperature";
import { windDirectionLabel } from "@/lib/weatherCodes";

export default function WeatherMetrics({ weather, unit }) {
  const reduceMotion = useReducedMotion();
  const { t } = useI18n();
  const current = weather.current;
  const daily = weather.daily;
  const uv = formatUvIndex(daily?.uv_index_max?.[0]);
  const precip =
    weather.hourly?.precipitation_probability?.[0] ??
    daily?.precipitation_probability_max?.[0];

  const metrics = [
    {
      icon: Droplets,
      label: t("Humidity"),
      value: formatPercent(current.relative_humidity_2m),
      detail: t("Relative humidity"),
    },
    {
      icon: Wind,
      label: t("Wind"),
      value: formatWindSpeed(current.wind_speed_10m, unit),
      detail: t("Sustained wind"),
    },
    {
      icon: Compass,
      label: t("Wind direction"),
      value: windDirectionLabel(current.wind_direction_10m),
      detail: t("Compass direction"),
    },
    {
      icon: Gauge,
      label: t("Pressure"),
      value: formatPressure(current.surface_pressure),
      detail: t("Surface pressure"),
    },
    {
      icon: Eye,
      label: t("Visibility"),
      value: formatVisibility(current.visibility, unit),
      detail: t("Horizontal visibility"),
    },
    {
      icon: Umbrella,
      label: t("Precipitation"),
      value: formatPercent(precip),
      detail: t("Chance of precipitation"),
    },
    {
      icon: Cloud,
      label: t("Cloud cover"),
      value: formatPercent(current.cloud_cover),
      detail: t("Sky coverage"),
    },
    {
      icon: Wind,
      label: t("Wind gusts"),
      value: formatWindSpeed(current.wind_gusts_10m, unit),
      detail: t("Peak gust speed"),
    },
    {
      icon: ThermometerSun,
      label: t("Dew point"),
      value: formatTemperature(current.dew_point_2m, unit),
      detail: t("Air moisture point"),
    },
    {
      icon: ThermometerSun,
      label: t("Feels like"),
      value: formatTemperature(current.apparent_temperature, unit),
      detail: t("Apparent temperature"),
    },
    {
      icon: ThermometerSun,
      label: t("UV index"),
      value: uv === "—" ? "—" : String(uv.value),
      detail: uv === "—" ? t("Daily maximum") : t(uv.level),
    },
  ];

  return (
    <section aria-label={t("Today's details")}>
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="mb-4"
      >
        <h2 className="text-lg font-semibold text-text dark:text-text-dark">
          {t("Today's details")}
        </h2>
        <p className="text-sm text-muted-soft">
          {t("Humidity, wind, pressure, and more")}
        </p>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: reduceMotion ? 0 : 0.04 * index,
            }}
          >
            <MetricCard {...metric} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
