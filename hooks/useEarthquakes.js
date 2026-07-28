"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getEarthquakes } from "@/lib/usgs";

const REFRESH_MS = 5 * 60 * 1000;

export default function useEarthquakes(filters) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const abortRef = useRef(null);
  const filtersRef = useRef(filters);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const fetchQuakes = useCallback(async (opts, { silent = false } = {}) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    if (!silent) {
      setLoading(true);
      setError(null);
    }

    try {
      const result = await getEarthquakes(opts, controller.signal);
      if (!controller.signal.aborted) {
        setData(result);
        setUpdatedAt(Date.now());
        setLoading(false);
        setError(null);
      }
    } catch (err) {
      if (err.name === "AbortError") return;
      if (!silent) {
        setError(err.message || "Unable to load earthquake data.");
      }
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuakes(filters);
    return () => abortRef.current?.abort();
  }, [filters, fetchQuakes]);

  useEffect(() => {
    const id = setInterval(() => {
      fetchQuakes(filtersRef.current, { silent: true });
    }, REFRESH_MS);
    return () => clearInterval(id);
  }, [fetchQuakes]);

  return {
    data,
    loading,
    error,
    updatedAt,
    retry: () => fetchQuakes(filters),
    refresh: () => fetchQuakes(filters, { silent: true }),
  };
}
