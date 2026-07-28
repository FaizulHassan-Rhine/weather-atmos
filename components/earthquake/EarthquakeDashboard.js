"use client";

import { useEffect, useMemo, useState } from "react";
import ErrorState from "@/components/ui/ErrorState";
import UpdatedStatus from "@/components/ui/UpdatedStatus";
import useEarthquakes from "@/hooks/useEarthquakes";
import { useI18n } from "@/hooks/useI18n";
import EarthquakeDetail from "./EarthquakeDetail";
import EarthquakeFilters from "./EarthquakeFilters";
import EarthquakeList from "./EarthquakeList";
import EarthquakeMap from "./EarthquakeMap";
import EarthquakeTimeline from "./EarthquakeTimeline";
import EmergencyGuidance from "./EmergencyGuidance";

export default function EarthquakeDashboard({
  location,
  theme,
  favorites,
  selectCity,
  bootstrapped,
}) {
  const { t } = useI18n();
  const [filters, setFilters] = useState({
    minMagnitude: 2.5,
    maxDepth: null,
    window: "7d",
    radiusKm: 1000,
  });
  const [selectedId, setSelectedId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const query = useMemo(
    () => ({
      minMagnitude: filters.minMagnitude,
      maxDepth: filters.maxDepth,
      window: filters.window,
      radiusKm: filters.radiusKm,
      latitude: filters.radiusKm != null ? location?.latitude : undefined,
      longitude: filters.radiusKm != null ? location?.longitude : undefined,
    }),
    [filters, location]
  );

  const { data, loading, error, updatedAt, retry, refresh } =
    useEarthquakes(query);

  const events = useMemo(() => data?.events ?? [], [data]);
  const selected =
    events.find((event) => event.id === selectedId) || events[0] || null;

  useEffect(() => {
    if (!events.length) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !events.some((event) => event.id === selectedId)) {
      setSelectedId(events[0].id);
    }
  }, [events, selectedId]);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      window.setTimeout(() => setRefreshing(false), 400);
    }
  }

  if (!bootstrapped) {
    return (
      <div className="space-y-4">
        <div className="card-surface h-40 animate-pulse bg-sky/15" />
        <div className="card-surface h-72 animate-pulse bg-sky/15" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text dark:text-text-dark">
            {t("Disaster & earthquake monitoring")}
          </h1>
          <p className="mt-1 text-sm text-muted-soft">
            {t("Live seismic activity with risk indicators and regional filters")}
          </p>
        </div>
        <UpdatedStatus
          updatedAt={updatedAt}
          onRefresh={handleRefresh}
          refreshing={refreshing || loading}
        />
      </div>

      <EarthquakeFilters
        filters={filters}
        onChange={setFilters}
        locationName={location?.name}
      />

      {favorites?.length ? (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-soft">{t("Saved regions")}:</span>
          {favorites.slice(0, 6).map((city) => (
            <button
              key={city.id || `${city.latitude}-${city.longitude}`}
              type="button"
              onClick={() => selectCity(city)}
              className="rounded-full border border-sky/40 bg-surface px-3 py-1.5 text-sm text-text transition hover:border-primary/40 dark:border-white/10 dark:bg-dark-surface dark:text-text-dark"
            >
              {city.name}
            </button>
          ))}
        </div>
      ) : null}

      {error && !events.length ? (
        <ErrorState
          variant="weather"
          title={t("Unable to load earthquakes")}
          description={error}
          onRetry={retry}
        />
      ) : (
        <>
          <EarthquakeMap
            events={events}
            location={location}
            theme={theme}
            selectedId={selected?.id}
            onSelect={(event) => setSelectedId(event.id)}
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <EarthquakeList
              events={events}
              selectedId={selected?.id}
              onSelect={(event) => setSelectedId(event.id)}
              loading={loading}
            />
            <EarthquakeDetail event={selected} />
          </div>

          <EarthquakeTimeline events={events} windowKey={filters.window} />
          <EmergencyGuidance />
        </>
      )}
    </div>
  );
}
