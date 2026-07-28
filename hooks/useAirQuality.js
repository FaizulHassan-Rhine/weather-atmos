"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getAirQuality } from "@/lib/openMeteo";

const REFRESH_MS = 12 * 60 * 1000;

/**
 * @param {{ latitude: number, longitude: number } | null} location
 * @param {{ includeHourly?: boolean }} [options]
 */
export default function useAirQuality(location, options = {}) {
  const { includeHourly = false } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const abortRef = useRef(null);
  const locationRef = useRef(location);
  const optionsRef = useRef({ includeHourly });

  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  useEffect(() => {
    optionsRef.current = { includeHourly };
  }, [includeHourly]);

  const fetchAir = useCallback(async (loc, opts, { silent = false } = {}) => {
    if (!loc?.latitude || !loc?.longitude) {
      setData(null);
      setLoading(false);
      setError(null);
      setUpdatedAt(null);
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    if (!silent) {
      setLoading(true);
      setError(null);
    }

    try {
      const result = await getAirQuality(loc, controller.signal, opts);
      if (!controller.signal.aborted) {
        setData(result);
        setUpdatedAt(Date.now());
        setLoading(false);
        setError(null);
      }
    } catch (err) {
      if (err.name === "AbortError") return;
      if (!silent) {
        setError(err.message || "Unable to load air quality.");
      }
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAir(location, { includeHourly });
    return () => abortRef.current?.abort();
  }, [location, includeHourly, fetchAir]);

  useEffect(() => {
    if (!location?.latitude) return undefined;
    const id = setInterval(() => {
      fetchAir(locationRef.current, optionsRef.current, { silent: true });
    }, REFRESH_MS);
    return () => clearInterval(id);
  }, [location, fetchAir]);

  return {
    data,
    loading,
    error,
    updatedAt,
    retry: () => fetchAir(location, { includeHourly }),
    refresh: () => fetchAir(location, { includeHourly }, { silent: true }),
  };
}
