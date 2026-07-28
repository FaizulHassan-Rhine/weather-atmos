"use client";

import { useState } from "react";
import CurrentWeather from "@/components/dashboard/CurrentWeather";
import WeatherMetrics from "@/components/dashboard/WeatherMetrics";
import HourlyForecast from "@/components/dashboard/HourlyForecast";
import WeeklyForecast from "@/components/dashboard/WeeklyForecast";
import WeatherMap from "@/components/dashboard/WeatherMap";
import WeatherCharts from "@/components/dashboard/WeatherCharts";
import WeatherAlerts from "@/components/dashboard/WeatherAlerts";
import AirQualitySection from "@/components/dashboard/AirQualitySection";
import AstronomyCard from "@/components/dashboard/AstronomyCard";
import CompareCities from "@/components/dashboard/CompareCities";
import RainOutlook from "@/components/dashboard/RainOutlook";
import UvIndexCard from "@/components/dashboard/UvIndexCard";
import ErrorState from "@/components/ui/ErrorState";
import UpdatedStatus from "@/components/ui/UpdatedStatus";
import {
  AstronomySkeleton,
  CurrentWeatherSkeleton,
  HourlySkeleton,
  MapSkeleton,
  MetricsSkeleton,
  RainOutlookSkeleton,
  UvSkeleton,
  WeeklySkeleton,
} from "@/components/ui/LoadingSkeleton";
import useAirQuality from "@/hooks/useAirQuality";
import useWeather from "@/hooks/useWeather";

export default function WeatherDashboard({
  location,
  unit,
  theme,
  favorites,
  selectCity,
  bootstrapped,
  locating,
}) {
  const [refreshing, setRefreshing] = useState(false);
  const {
    data: weather,
    loading,
    error,
    retry,
    refresh,
    updatedAt,
  } = useWeather(location);
  const {
    data: airQuality,
    loading: airLoading,
    error: airError,
    retry: retryAir,
  } = useAirQuality(location);

  async function handleManualRefresh() {
    setRefreshing(true);
    try {
      await refresh();
      retryAir();
    } finally {
      window.setTimeout(() => setRefreshing(false), 400);
    }
  }

  const showInitialLoading =
    !bootstrapped || (!weather && loading) || (locating && !weather);

  return (
    <>
      {showInitialLoading ? (
        <div className="space-y-6">
          <CurrentWeatherSkeleton />
          <HourlySkeleton />
          <RainOutlookSkeleton />
          <WeeklySkeleton />
          <MetricsSkeleton />
          <UvSkeleton />
          <AstronomySkeleton />
          <MapSkeleton />
        </div>
      ) : null}

      {!showInitialLoading && error ? (
        <ErrorState variant="weather" description={error} onRetry={retry} />
      ) : null}

      {!showInitialLoading && !error && weather && location ? (
        <div className="space-y-6">
          <UpdatedStatus
            updatedAt={updatedAt}
            onRefresh={handleManualRefresh}
            refreshing={refreshing || loading}
          />
          <CurrentWeather location={location} weather={weather} unit={unit} />
          <HourlyForecast weather={weather} unit={unit} />
          <RainOutlook weather={weather} />
          <WeeklyForecast weather={weather} unit={unit} />
          <WeatherMetrics weather={weather} unit={unit} />
          <UvIndexCard weather={weather} />
          <AstronomyCard weather={weather} location={location} />
          <WeatherCharts weather={weather} unit={unit} />
          <WeatherAlerts weather={weather} />
          <AirQualitySection
            data={airQuality}
            loading={airLoading}
            error={airError}
            onRetry={retryAir}
          />
          <WeatherMap location={location} theme={theme} />
          <CompareCities
            favorites={favorites}
            unit={unit}
            onSelect={selectCity}
          />
        </div>
      ) : null}

      {!showInitialLoading && !error && !weather && !location ? (
        <ErrorState variant="empty" />
      ) : null}
    </>
  );
}
