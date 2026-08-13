"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getEarthquakes } from "@/lib/usgs";
import {
  WINDOW_DAYS,
  earthquakeToDisaster,
  filterDisasterEvents,
} from "@/lib/disasters";

const REFRESH_MS = 5 * 60 * 1000;

async function getRemoteDisasters(days, signal) {
  const response = await fetch(`/api/disasters?days=${days}`, { signal });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Unable to load disaster feeds.");
  }
  return data;
}

export default function useDisasters(filters) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const abortRef = useRef(null);
  const filtersRef = useRef(filters);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const fetchAll = useCallback(async (opts, { silent = false } = {}) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    if (!silent) {
      setLoading(true);
      setError(null);
    }

    try {
      const days = WINDOW_DAYS[opts.window] ?? 7;
      const [quakesResult, remoteResult] = await Promise.allSettled([
        getEarthquakes(
          {
            minMagnitude: opts.minMagnitude,
            maxDepth: opts.maxDepth,
            window: opts.window,
            latitude: opts.radiusKm != null ? opts.latitude : undefined,
            longitude: opts.radiusKm != null ? opts.longitude : undefined,
            radiusKm: opts.radiusKm,
            limit: 200,
          },
          controller.signal
        ),
        getRemoteDisasters(days, controller.signal),
      ]);

      if (controller.signal.aborted) return;

      const quakes =
        quakesResult.status === "fulfilled" ? quakesResult.value : { events: [] };
      const remote =
        remoteResult.status === "fulfilled"
          ? remoteResult.value
          : { events: [], sources: {} };

      if (!quakes.events?.length && !remote.events?.length) {
        throw new Error(
          quakesResult.reason?.message ||
            remoteResult.reason?.message ||
            "Unable to load disaster data."
        );
      }

      const merged = [
        ...(quakes.events || []).map(earthquakeToDisaster),
        ...(remote.events || []),
      ].sort((a, b) => {
        const aTime = a.time ? new Date(a.time).getTime() : 0;
        const bTime = b.time ? new Date(b.time).getTime() : 0;
        return bTime - aTime;
      });

      const events = filterDisasterEvents(merged, {
        window: opts.window,
        radiusKm: opts.radiusKm,
        latitude: opts.latitude,
        longitude: opts.longitude,
        minMagnitude: opts.minMagnitude,
        maxDepth: opts.maxDepth,
      });

      setData({
        events,
        count: events.length,
        sources: {
          usgs: quakesResult.status === "fulfilled",
          eonet: Boolean(remote.sources?.eonet),
          noaa: Boolean(remote.sources?.noaa),
        },
        generated: remote.generated || quakes.generated,
      });
      setUpdatedAt(Date.now());
      setLoading(false);
      setError(null);
    } catch (err) {
      if (err.name === "AbortError") return;
      if (!silent) {
        setError(err.message || "Unable to load disaster data.");
      }
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll(filters);
    return () => abortRef.current?.abort();
  }, [filters, fetchAll]);

  useEffect(() => {
    const id = setInterval(() => {
      fetchAll(filtersRef.current, { silent: true });
    }, REFRESH_MS);
    return () => clearInterval(id);
  }, [fetchAll]);

  return {
    data,
    loading,
    error,
    updatedAt,
    retry: () => fetchAll(filters),
    refresh: () => fetchAll(filters, { silent: true }),
  };
}
