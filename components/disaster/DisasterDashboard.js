"use client";

import { useEffect, useMemo, useState } from "react";
import ErrorState from "@/components/ui/ErrorState";
import UpdatedStatus from "@/components/ui/UpdatedStatus";
import useDisasters from "@/hooks/useDisasters";
import { useI18n } from "@/hooks/useI18n";
import { DISASTER_TYPE_IDS, toggleDisasterTypes } from "@/lib/disasters";
import DisasterDetail from "./DisasterDetail";
import DisasterFilters from "./DisasterFilters";
import DisasterGuidance from "./DisasterGuidance";
import DisasterList from "./DisasterList";
import DisasterMap from "./DisasterMap";
import DisasterStats from "./DisasterStats";
import DisasterTimeline from "./DisasterTimeline";

export default function DisasterDashboard({
  location,
  theme,
  favorites,
  selectCity,
  bootstrapped,
}) {
  const { t } = useI18n();
  const [filters, setFilters] = useState({
    types: [...DISASTER_TYPE_IDS],
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
    [filters.maxDepth, filters.minMagnitude, filters.radiusKm, filters.window, location]
  );

  const { data, loading, error, updatedAt, retry, refresh } =
    useDisasters(query);

  const events = useMemo(() => {
    const all = data?.events ?? [];
    const types = filters.types?.length ? new Set(filters.types) : null;
    if (!types || types.size === DISASTER_TYPE_IDS.length) return all;
    return all.filter((event) => types.has(event.type));
  }, [data, filters.types]);

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

  function toggleType(id) {
    setFilters((prev) => ({
      ...prev,
      types: toggleDisasterTypes(prev.types, id),
    }));
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
            {t("Global Disaster Monitor")}
          </h1>
          <p className="mt-1 text-sm text-muted-soft">
            {t("Live earthquakes, storms, wildfires, floods, and emergency events")}
          </p>
        </div>
        <UpdatedStatus
          updatedAt={updatedAt}
          onRefresh={handleRefresh}
          refreshing={refreshing || loading}
        />
      </div>

      <DisasterFilters
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
          title={t("Unable to load disaster events")}
          description={error}
          onRetry={retry}
        />
      ) : (
        <>
          <DisasterStats
            events={data?.events ?? []}
            activeTypes={filters.types}
            onToggleType={toggleType}
          />

          <DisasterMap
            events={events}
            location={location}
            theme={theme}
            selectedId={selected?.id}
            onSelect={(event) => setSelectedId(event.id)}
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <DisasterList
              events={events}
              selectedId={selected?.id}
              onSelect={(event) => setSelectedId(event.id)}
              loading={loading}
            />
            <DisasterDetail event={selected} />
          </div>

          <DisasterTimeline events={events} windowKey={filters.window} />
          <DisasterGuidance activeType={selected?.type} />
        </>
      )}
    </div>
  );
}
