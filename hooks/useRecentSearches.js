"use client";

import useLocalStorage from "@/hooks/useLocalStorage";

const MAX_RECENT = 10;

function normalizeCity(city) {
  if (!city?.latitude || !city?.longitude) return null;
  return {
    id: city.id || `${city.latitude}-${city.longitude}`,
    name: city.name || "Unknown",
    admin1: city.admin1 || "",
    country: city.country || "",
    countryCode: city.countryCode || "",
    latitude: city.latitude,
    longitude: city.longitude,
    timezone: city.timezone || "auto",
  };
}

export default function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useLocalStorage("atmos-recent-searches", []);

  function addRecentSearch(city) {
    const normalized = normalizeCity(city);
    if (!normalized) return;
    setRecentSearches((prev = []) => {
      const withoutDuplicate = prev.filter((item) => item.id !== normalized.id);
      return [normalized, ...withoutDuplicate].slice(0, MAX_RECENT);
    });
  }

  function removeRecentSearch(cityId) {
    setRecentSearches((prev = []) => prev.filter((item) => item.id !== cityId));
  }

  function clearRecentSearches() {
    setRecentSearches([]);
  }

  return {
    recentSearches: Array.isArray(recentSearches) ? recentSearches : [],
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
  };
}
