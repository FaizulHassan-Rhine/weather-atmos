"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/hooks/useI18n";
import { formatPollutantChartValue } from "@/lib/airHealth";
import { findCurrentHourIndex, formatHourLabel } from "@/lib/date";

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-sky/30 bg-surface px-3 py-2 text-xs shadow-sm dark:border-white/10 dark:bg-dark-surface">
      <p className="mb-1 font-medium text-text dark:text-text-dark">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
}

export default function PollutantCharts({ data }) {
  const reduceMotion = useReducedMotion();
  const { t } = useI18n();
  const hourly = data?.hourly;
  const timezone = data?.timezone;

  const chartData = useMemo(() => {
    if (!hourly?.time?.length) return [];
    const start = Math.max(0, findCurrentHourIndex(hourly.time, timezone) - 6);
    const end = Math.min(hourly.time.length, start + 24);

    return hourly.time.slice(start, end).map((time, offset) => {
      const index = start + offset;
      return {
        label: formatHourLabel(time, timezone),
        pm25: formatPollutantChartValue(hourly.pm2_5?.[index], 1),
        pm10: formatPollutantChartValue(hourly.pm10?.[index], 1),
        ozone: formatPollutantChartValue(hourly.ozone?.[index], 0),
        co: formatPollutantChartValue(hourly.carbon_monoxide?.[index], 0),
      };
    });
  }, [hourly, timezone]);

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-surface p-5 sm:p-6"
      aria-label={t("Hourly pollution charts")}
    >
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-text dark:text-text-dark">
          {t("Hourly pollution charts")}
        </h2>
        <p className="text-sm text-muted-soft">
          {t("PM2.5, PM10, ozone, and carbon monoxide trends")}
        </p>
      </div>

      {!chartData.length ? (
        <p className="py-10 text-center text-sm text-muted-soft">
          {t("No hourly pollution data available.")}
        </p>
      ) : (
        <div className="h-64 w-full sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(169,198,217,0.35)" />
              <XAxis
                dataKey="label"
                tick={{ fill: "#718087", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: "#718087", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="pm25"
                name="PM2.5"
                stroke="#4F8F8B"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="pm10"
                name="PM10"
                stroke="#6F92B5"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="ozone"
                name={t("Ozone")}
                stroke="#E7B98D"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="co"
                name="CO"
                stroke="#A9C6D9"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.section>
  );
}
