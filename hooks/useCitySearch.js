"use client";

import { useEffect, useRef, useState } from "react";
import { searchCities } from "@/lib/openMeteo";

const DEBOUNCE_MS = 350;

export default function useCitySearch(query, language = "en") {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      setError(null);
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
      return undefined;
    }

    setLoading(true);
    setError(null);

    const timer = setTimeout(async () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const cities = await searchCities(
          trimmed,
          controller.signal,
          language
        );
        if (!controller.signal.aborted) {
          setResults(cities);
          setLoading(false);
        }
      } catch (err) {
        if (err.name === "AbortError") return;
        setResults([]);
        setError(err.message || "Search failed. Please try again.");
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, [query, language]);

  return { results, loading, error };
}
