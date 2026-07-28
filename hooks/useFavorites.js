"use client";

import { useCallback } from "react";
import useLocalStorage from "./useLocalStorage";

function locationKey(city) {
  return `${Number(city.latitude).toFixed(4)},${Number(city.longitude).toFixed(4)}`;
}

export default function useFavorites() {
  const [favorites, setFavorites, hydrated] = useLocalStorage("atmos-favorites", []);

  const isFavorite = useCallback(
    (city) => {
      if (!city) return false;
      const key = locationKey(city);
      return favorites.some((item) => locationKey(item) === key);
    },
    [favorites]
  );

  const addFavorite = useCallback(
    (city) => {
      if (!city) return;
      setFavorites((prev) => {
        const key = locationKey(city);
        if (prev.some((item) => locationKey(item) === key)) {
          return prev;
        }
        return [
          ...prev,
          {
            id: city.id ?? key,
            name: city.name,
            admin1: city.admin1 ?? "",
            country: city.country ?? "",
            countryCode: city.countryCode ?? "",
            latitude: city.latitude,
            longitude: city.longitude,
            timezone: city.timezone ?? "auto",
          },
        ];
      });
    },
    [setFavorites]
  );

  const removeFavorite = useCallback(
    (city) => {
      if (!city) return;
      const key = locationKey(city);
      setFavorites((prev) => prev.filter((item) => locationKey(item) !== key));
    },
    [setFavorites]
  );

  const toggleFavorite = useCallback(
    (city) => {
      if (isFavorite(city)) {
        removeFavorite(city);
      } else {
        addFavorite(city);
      }
    },
    [addFavorite, isFavorite, removeFavorite]
  );

  return {
    favorites,
    hydrated,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
  };
}
