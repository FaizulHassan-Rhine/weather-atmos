"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/hooks/useI18n";
import { formatDayName, formatHourLabel, findCurrentHourIndex } from "@/lib/date";
import { celsiusToFahrenheit } from "@/lib/temperature";

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-sky/30 bg-surface px-3 py-2 text-xs shadow-sm dark:border-white/10 dark:bg-dark-surface">
      <p className="mb-1 font-medium text-text dark:text-text-dark">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ color: entry.color }} className="text-muted-soft">
          {entry.name}: {entry.value}
          {entry.unit ?? ""}
        </p>
      ))}
    </div>
  );
}

const CHART_COLORS = {
  grid: "color-mix(in srgb, var(--color-sky) 35%, transparent)",
  tick: "var(--color-muted)",
  temp: "var(--color-primary)",
  precip: "var(--color-secondary)",
  low: "var(--color-sky)",
  accent: "var(--color-accent)",
};

export default function WeatherCharts({ weather, unit }) {
  const reduceMotion = useReducedMotion();
  const { t } = useI18n();
  const [range, setRange] = useState("hourly");
  const timezone = weather.timezone;
  const isF = unit === "f";

  const hourlyData = useMemo(() => {
    const times = weather.hourly?.time ?? [];
    const start = findCurrentHourIndex(times, timezone);
    const end = Math.min(times.length, start + 24);

    return times.slice(start, end).map((time, offset) => {
      const index = start + offset;
      const c = weather.hourly.temperature_2m[index];
      return {
        label: formatHourLabel(time, timezone),
        temp: Math.round(isF ? celsiusToFahrenheit(c) : c),
        precip: weather.hourly.precipitation_probability[index] ?? 0,
      };
    });
  }, [weather, timezone, isF]);

  const dailyData = useMemo(() => {
    return (weather.daily?.time ?? []).map((time, index) => {
      const maxC = weather.daily.temperature_2m_max[index];
      const minC = weather.daily.temperature_2m_min[index];
      return {
        label: index === 0 ? "Today" : formatDayName(time, timezone, { short: true }),
        high: Math.round(isF ? celsiusToFahrenheit(maxC) : maxC),
        low: Math.round(isF ? celsiusToFahrenheit(minC) : minC),
        precip: weather.daily.precipitation_probability_max[index] ?? 0,
      };
    });
  }, [weather, timezone, isF]);

  const tempUnit = isF ? "°F" : "°C";

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.08 }}
      className="card-surface p-5 sm:p-6"
      aria-label={t("Trends")}
    >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-text dark:text-text-dark">
            {t("Trends")}
          </h2>
          <p className="text-sm text-muted-soft">
            {t("Temperature and precipitation probability")}
          </p>
        </div>
        <div
          role="group"
          aria-label="Chart range"
          className="inline-flex rounded-full border border-sky/40 bg-bg/70 p-1 dark:border-white/10 dark:bg-dark-bg/60"
        >
          <button
            type="button"
            aria-pressed={range === "hourly"}
            onClick={() => setRange("hourly")}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              range === "hourly"
                ? "bg-primary text-white"
                : "text-muted hover:text-text dark:hover:text-text-dark"
            }`}
          >
            24h
          </button>
          <button
            type="button"
            aria-pressed={range === "weekly"}
            onClick={() => setRange("weekly")}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              range === "weekly"
                ? "bg-primary text-white"
                : "text-muted hover:text-text dark:hover:text-text-dark"
            }`}
          >
            7-day
          </button>
        </div>
      </div>

      <div className="h-64 w-full text-muted sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          {range === "hourly" ? (
            <AreaChart data={hourlyData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="tempFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.temp} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={CHART_COLORS.temp} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
              <XAxis
                dataKey="label"
                tick={{ fill: CHART_COLORS.tick, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                yAxisId="temp"
                tick={{ fill: CHART_COLORS.tick, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                unit={tempUnit}
              />
              <YAxis
                yAxisId="precip"
                orientation="right"
                domain={[0, 100]}
                tick={{ fill: CHART_COLORS.tick, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                unit="%"
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend />
              <Area
                yAxisId="temp"
                type="monotone"
                dataKey="temp"
                name={`Temp (${tempUnit})`}
                stroke={CHART_COLORS.temp}
                fill="url(#tempFill)"
                strokeWidth={2}
                unit={tempUnit}
              />
              <Bar
                yAxisId="precip"
                dataKey="precip"
                name="Precip %"
                fill={CHART_COLORS.precip}
                opacity={0.55}
                radius={[4, 4, 0, 0]}
                unit="%"
              />
            </AreaChart>
          ) : (
            <BarChart data={dailyData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
              <XAxis
                dataKey="label"
                tick={{ fill: CHART_COLORS.tick, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="temp"
                tick={{ fill: CHART_COLORS.tick, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                unit={tempUnit}
              />
              <YAxis
                yAxisId="precip"
                orientation="right"
                domain={[0, 100]}
                tick={{ fill: CHART_COLORS.tick, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                unit="%"
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend />
              <Bar
                yAxisId="temp"
                dataKey="high"
                name={`High (${tempUnit})`}
                fill={CHART_COLORS.temp}
                radius={[6, 6, 0, 0]}
                unit={tempUnit}
              />
              <Bar
                yAxisId="temp"
                dataKey="low"
                name={`Low (${tempUnit})`}
                fill={CHART_COLORS.low}
                radius={[6, 6, 0, 0]}
                unit={tempUnit}
              />
              <Bar
                yAxisId="precip"
                dataKey="precip"
                name="Precip %"
                fill={CHART_COLORS.accent}
                opacity={0.7}
                radius={[6, 6, 0, 0]}
                unit="%"
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </motion.section>
  );
}
