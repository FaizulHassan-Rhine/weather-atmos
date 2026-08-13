"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import ErrorState from "@/components/ui/ErrorState";
import { useI18n } from "@/hooks/useI18n";
import {
  loadGoogleMaps,
  resetGoogleMapsLoader,
} from "@/lib/googleMaps";
import {
  DISASTER_COLORS,
  DISASTER_TYPES,
  markerScale,
} from "@/lib/disasters";
import { darkMapStyles, lightMapStyles } from "@/lib/mapStyles";

function markerIcon(color, selected, size) {
  const diameter = selected ? size + 6 : size;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${diameter}" height="${diameter}" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="9" fill="${color}" fill-opacity="${selected ? 0.95 : 0.75}" stroke="#ffffff" stroke-width="${selected ? 3 : 2}"/>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export default function DisasterMap({
  events,
  location,
  theme,
  selectedId,
  onSelect,
}) {
  const reduceMotion = useReducedMotion();
  const { t } = useI18n();
  const mapNodeRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [status, setStatus] = useState("idle");
  const [errorVariant, setErrorVariant] = useState("maps");
  const [retryToken, setRetryToken] = useState(0);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    let cancelled = false;

    async function initMap() {
      if (!apiKey) {
        setErrorVariant("mapsKey");
        setStatus("error");
        return;
      }

      setStatus("loading");

      try {
        await loadGoogleMaps(apiKey);
        if (cancelled || !mapNodeRef.current || !window.google?.maps) return;

        const center = location
          ? {
              lat: Number(location.latitude),
              lng: Number(location.longitude),
            }
          : { lat: 20, lng: 0 };

        const styles = theme === "dark" ? darkMapStyles : lightMapStyles;

        if (!mapRef.current) {
          mapRef.current = new window.google.maps.Map(mapNodeRef.current, {
            center,
            zoom: location ? 4 : 2,
            disableDefaultUI: true,
            zoomControl: true,
            styles,
            backgroundColor: theme === "dark" ? "#17242A" : "#F4F7F8",
          });
        } else {
          mapRef.current.setOptions({ styles });
          mapRef.current.panTo(center);
        }

        if (!cancelled) setStatus("ready");
      } catch {
        resetGoogleMapsLoader();
        mapRef.current = null;
        if (!cancelled) {
          setErrorVariant("maps");
          setStatus("error");
        }
      }
    }

    initMap();
    return () => {
      cancelled = true;
    };
  }, [apiKey, location, theme, retryToken]);

  useEffect(() => {
    if (status !== "ready" || !mapRef.current || !window.google?.maps) return;

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    (events || []).forEach((event) => {
      if (event.latitude == null || event.longitude == null) return;
      const color =
        DISASTER_COLORS[event.type] || DISASTER_COLORS.emergency;
      const selected = event.id === selectedId;
      const size = markerScale(event);
      const marker = new window.google.maps.Marker({
        map: mapRef.current,
        position: { lat: event.latitude, lng: event.longitude },
        icon: {
          url: markerIcon(color, selected, size),
          scaledSize: new window.google.maps.Size(
            selected ? size + 6 : size,
            selected ? size + 6 : size
          ),
          anchor: new window.google.maps.Point(
            (selected ? size + 6 : size) / 2,
            (selected ? size + 6 : size) / 2
          ),
        },
        zIndex: selected ? 20 : event.severity === "extreme" ? 8 : 1,
        title: event.title,
      });
      marker.addListener("click", () => onSelect?.(event));
      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
    };
  }, [events, selectedId, status, onSelect]);

  useEffect(() => {
    if (!mapRef.current || !selectedId || !events?.length) return;
    const event = events.find((item) => item.id === selectedId);
    if (!event?.latitude) return;
    mapRef.current.panTo({ lat: event.latitude, lng: event.longitude });
  }, [selectedId, events]);

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-surface overflow-hidden"
      aria-label={t("Global disaster map")}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-sky/20 px-5 py-4 dark:border-white/8">
        <div>
          <h2 className="text-lg font-semibold text-text dark:text-text-dark">
            {t("Global disaster map")}
          </h2>
          <p className="text-sm text-muted-soft">
            {t("Live earthquakes, storms, wildfires, floods, and emergency events")}
          </p>
        </div>
        <ul className="flex flex-wrap gap-2 text-xs text-muted-soft">
          {DISASTER_TYPES.map((item) => (
            <li key={item.id} className="inline-flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: DISASTER_COLORS[item.id] }}
                aria-hidden
              />
              {t(item.label)}
            </li>
          ))}
        </ul>
      </div>

      {status === "error" ? (
        <div className="p-4 sm:p-6">
          <ErrorState
            variant={errorVariant}
            onRetry={
              errorVariant === "mapsKey"
                ? undefined
                : () => {
                    resetGoogleMapsLoader();
                    setRetryToken((value) => value + 1);
                  }
            }
          />
        </div>
      ) : (
        <div className="relative h-80 w-full sm:h-[28rem]">
          {(status === "loading" || status === "idle") && (
            <div className="absolute inset-0 z-10 animate-pulse bg-sky/20 dark:bg-white/8" />
          )}
          <div ref={mapNodeRef} className="h-full w-full" />
        </div>
      )}
    </motion.section>
  );
}
