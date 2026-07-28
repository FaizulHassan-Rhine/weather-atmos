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
  RISK_MARKER_COLORS,
  getRiskInfo,
  markerRadius,
} from "@/lib/earthquake";
import { darkMapStyles, lightMapStyles } from "@/lib/mapStyles";

export default function EarthquakeMap({
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
            zoom: location ? 5 : 2,
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

  // Sync circle markers with events
  useEffect(() => {
    if (status !== "ready" || !mapRef.current || !window.google?.maps) return;

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    (events || []).forEach((event) => {
      if (event.latitude == null || event.longitude == null) return;
      const risk = getRiskInfo(event.mag);
      const color = RISK_MARKER_COLORS[risk.tone] || RISK_MARKER_COLORS.muted;
      const circle = new window.google.maps.Circle({
        strokeColor: color,
        strokeOpacity: 0.9,
        strokeWeight: event.id === selectedId ? 3 : 1.5,
        fillColor: color,
        fillOpacity: event.id === selectedId ? 0.55 : 0.35,
        map: mapRef.current,
        center: { lat: event.latitude, lng: event.longitude },
        radius: markerRadius(event.mag) * 12000,
        zIndex: event.id === selectedId ? 10 : 1,
      });

      circle.addListener("click", () => onSelect?.(event));
      markersRef.current.push(circle);
    });

    return () => {
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
    };
  }, [events, selectedId, status, onSelect]);

  // Pan to selected event
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
      aria-label={t("Earthquake map")}
    >
      <div className="border-b border-sky/20 px-5 py-4 dark:border-white/8">
        <h2 className="text-lg font-semibold text-text dark:text-text-dark">
          {t("Earthquake map")}
        </h2>
        <p className="text-sm text-muted-soft">
          {t("Markers sized by magnitude and colored by risk")}
        </p>
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
        <div className="relative h-72 w-full sm:h-96">
          {(status === "loading" || status === "idle") && (
            <div className="absolute inset-0 z-10 animate-pulse bg-sky/20 dark:bg-white/8" />
          )}
          <div ref={mapNodeRef} className="h-full w-full" />
        </div>
      )}
    </motion.section>
  );
}
