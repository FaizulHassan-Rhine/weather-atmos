"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/hooks/useI18n";
import { buildTimeline } from "@/lib/earthquake";

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

export default function EarthquakeTimeline({ events, windowKey }) {
  const reduceMotion = useReducedMotion();
  const { t } = useI18n();
  const data = buildTimeline(events, windowKey);

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-surface p-5 sm:p-6"
      aria-label={t("Earthquake timeline")}
    >
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-text dark:text-text-dark">
          {t("Earthquake timeline")}
        </h2>
        <p className="text-sm text-muted-soft">
          {t("Event count and peak magnitude over time")}
        </p>
      </div>

      {!data.length ? (
        <p className="py-10 text-center text-sm text-muted-soft">
          {t("No timeline data for these filters.")}
        </p>
      ) : (
        <div className="h-64 w-full sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(169,198,217,0.35)" />
              <XAxis
                dataKey="label"
                tick={{ fill: "#718087", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="count"
                tick={{ fill: "#718087", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="mag"
                orientation="right"
                tick={{ fill: "#718087", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend />
              <Bar
                yAxisId="count"
                dataKey="count"
                name={t("Events")}
                fill="#4F8F8B"
                radius={[6, 6, 0, 0]}
              />
              <Line
                yAxisId="mag"
                type="monotone"
                dataKey="maxMag"
                name={t("Max magnitude")}
                stroke="#E7B98D"
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.section>
  );
}
