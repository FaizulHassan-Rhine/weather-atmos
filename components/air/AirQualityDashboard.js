"use client";

import { useState } from "react";
import { Leaf, Wind } from "lucide-react";
import MetricCard from "@/components/ui/MetricCard";
import ErrorState from "@/components/ui/ErrorState";
import UpdatedStatus from "@/components/ui/UpdatedStatus";
import {
  CurrentWeatherSkeleton,
  MetricsSkeleton,
} from "@/components/ui/LoadingSkeleton";
import useAirQuality from "@/hooks/useAirQuality";
import { useI18n } from "@/hooks/useI18n";
import { formatPollutant, getAqiInfo } from "@/lib/airQuality";
import { RISK_TONE_CLASSES } from "@/lib/earthquake";
import AirComparison from "./AirComparison";
import BestOutdoorTime from "./BestOutdoorTime";
import HealthRecommendations from "./HealthRecommendations";
import PollutantCharts from "./PollutantCharts";

export default function AirQualityDashboard({
  location,
  favorites,
  selectCity,
  bootstrapped,
  locating,
}) {
  const { t } = useI18n();
  const [refreshing, setRefreshing] = useState(false);
  const { data, loading, error, updatedAt, retry, refresh } = useAirQuality(
    location,
    { includeHourly: true }
  );

  const current = data?.current;
  const aqi = getAqiInfo(current?.european_aqi);
  const toneClass = RISK_TONE_CLASSES[aqi.tone] || RISK_TONE_CLASSES.muted;

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      window.setTimeout(() => setRefreshing(false), 400);
    }
  }

  const showLoading =
    !bootstrapped || locating || (loading && !data) || !location;

  if (showLoading) {
    return (
      <div className="space-y-6">
        <CurrentWeatherSkeleton />
        <MetricsSkeleton />
      </div>
    );
  }

  if (error && !data) {
    return (
      <ErrorState
        variant="weather"
        title={t("Unable to load air quality")}
        description={error}
        onRetry={retry}
      />
    );
  }

  if (!current) {
    return <ErrorState variant="empty" />;
  }

  const pollutants = [
    {
      icon: Wind,
      label: "PM2.5",
      value: formatPollutant(current.pm2_5, "µg/m³", 1),
      detail: t("Fine particles"),
    },
    {
      icon: Wind,
      label: "PM10",
      value: formatPollutant(current.pm10, "µg/m³", 1),
      detail: t("Coarse particles"),
    },
    {
      icon: Leaf,
      label: t("Ozone"),
      value: formatPollutant(current.ozone, "µg/m³", 0),
      detail: "O₃",
    },
    {
      icon: Leaf,
      label: "CO",
      value: formatPollutant(current.carbon_monoxide, "µg/m³", 0),
      detail: t("Carbon monoxide"),
    },
    {
      icon: Wind,
      label: "NO₂",
      value: formatPollutant(current.nitrogen_dioxide, "µg/m³", 0),
      detail: t("Nitrogen dioxide"),
    },
    {
      icon: Wind,
      label: "SO₂",
      value: formatPollutant(current.sulphur_dioxide, "µg/m³", 0),
      detail: t("Sulphur dioxide"),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text dark:text-text-dark">
            {t("Air quality & pollution tracker")}
          </h1>
          <p className="mt-1 text-sm text-muted-soft">
            {location.name}
            {location.country ? `, ${location.country}` : ""}
          </p>
        </div>
        <UpdatedStatus
          updatedAt={updatedAt}
          onRefresh={handleRefresh}
          refreshing={refreshing || loading}
        />
      </div>

      <section className="card-surface relative overflow-hidden p-6 sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-mint/60 blur-3xl dark:bg-primary/20"
        />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary dark:text-sky">
              {t("Air Quality Index")}
            </p>
            <p className="mt-3 text-6xl font-semibold tracking-tight text-text dark:text-text-dark">
              {current.european_aqi != null
                ? Math.round(current.european_aqi)
                : "—"}
            </p>
            <p className="mt-2 text-sm text-muted-soft">
              {t("European AQI")} · US{" "}
              {current.us_aqi != null ? Math.round(current.us_aqi) : "—"}
            </p>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium ${toneClass}`}
          >
            {t(aqi.level)} — {t(aqi.detail)}
          </span>
        </div>
      </section>

      <section aria-label={t("Pollutant levels")}>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-text dark:text-text-dark">
            {t("Pollutant levels")}
          </h2>
          <p className="text-sm text-muted-soft">
            {t("Current particle and gas concentrations")}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {pollutants.map((item) => (
            <MetricCard key={item.label} {...item} />
          ))}
        </div>
      </section>

      <PollutantCharts data={data} />
      <BestOutdoorTime data={data} />
      <HealthRecommendations current={current} />
      <AirComparison favorites={favorites} onSelect={selectCity} />
    </div>
  );
}
