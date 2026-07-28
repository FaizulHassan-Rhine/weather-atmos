"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getWeather } from "@/lib/openMeteo";

const REFRESH_MS = 12 * 60 * 1000; // 12 minutes

export default function useWeather(location) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const abortRef = useRef(null);
  const requestIdRef = useRef(0);
  const locationRef = useRef(location);

  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  const fetchWeather = useCallback(async (loc, { silent = false } = {}) => {
    if (!loc?.latitude || !loc?.longitude) {
      setData(null);
      setLoading(false);
      setError(null);
      setUpdatedAt(null);
      return;
    }

    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;
    const requestId = ++requestIdRef.current;

    if (!silent) {
      setLoading(true);
      setError(null);
    }

    try {
      const weather = await getWeather(loc, controller.signal);
      if (requestId === requestIdRef.current && !controller.signal.aborted) {
        setData(weather);
        setUpdatedAt(Date.now());
        setLoading(false);
        setError(null);
      }
    } catch (err) {
      if (err.name === "AbortError") return;
      if (requestId === requestIdRef.current) {
        if (!silent) {
          setError(err.message || "Unable to load weather data.");
        }
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchWeather(location);

    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, [location, fetchWeather]);

  // Auto-refresh while a location is selected
  useEffect(() => {
    if (!location?.latitude) return undefined;

    const id = setInterval(() => {
      fetchWeather(locationRef.current, { silent: true });
    }, REFRESH_MS);

    return () => clearInterval(id);
  }, [location, fetchWeather]);

  const retry = useCallback(() => {
    fetchWeather(location);
  }, [fetchWeather, location]);

  const refresh = useCallback(() => {
    return fetchWeather(location, { silent: true });
  }, [fetchWeather, location]);

  return {
    data,
    loading,
    error,
    retry,
    refresh,
    updatedAt,
  };
}
