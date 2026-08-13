"use client";

import {
  Bar,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
} from "recharts";
import { motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/hooks/useI18n";
import { DISASTER_COLORS, buildDisasterTimeline } from "@/lib/disasters";

function ChartTooltip({ active, payload, label, t }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-sky/30 bg-surface px-3 py-2 text-xs shadow-sm dark:border-white/10 dark:bg-dark-surface">
      <p className="mb-1 font-medium text-text dark:text-text-dark">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ color: entry.color }}>
          {t(entry.name)}: {entry.value}
        </p>
      ))}
    </div>
  );
}

export default function DisasterTimeline({ events, windowKey }) {
  const reduceMotion = useReducedMotion();
  const { t } = useI18n();
  const data = buildDisasterTimeline(events, windowKey);

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-surface p-5 sm:p-6"
      aria-label={t("Disaster timeline")}
    >
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-text dark:text-text-dark">
          {t("Disaster timeline")}
        </h2>
        <p className="text-sm text-muted-soft">
          {t("Event counts by type over time")}
        </p>
      </div>

      {!data.length ? (
        <p className="py-10 text-center text-sm text-muted-soft">
          {t("No timeline data for these filters.")}
        </p>
      ) : (
        <div className="h-64 w-full sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(169,198,217,0.35)" />
              <XAxis
                dataKey="label"
                tick={{ fill: "#718087", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fill: "#718087", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<ChartTooltip t={t} />} />
              <Legend />
              <Bar dataKey="earthquake" name={t("Earthquakes")} stackId="a" fill={DISASTER_COLORS.earthquake} />
              <Bar dataKey="storm" name={t("Storms")} stackId="a" fill={DISASTER_COLORS.storm} />
              <Bar dataKey="wildfire" name={t("Wildfires")} stackId="a" fill={DISASTER_COLORS.wildfire} />
              <Bar dataKey="flood" name={t("Floods")} stackId="a" fill={DISASTER_COLORS.flood} />
              <Bar
                dataKey="emergency"
                name={t("Emergency")}
                stackId="a"
                fill={DISASTER_COLORS.emergency}
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.section>
  );
}
