"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CloudRain } from "lucide-react";
import ErrorState from "@/components/ui/ErrorState";
import { useI18n } from "@/hooks/useI18n";
import {
  clearOverlayMapType,
  loadGoogleMaps,
  resetGoogleMapsLoader,
} from "@/lib/googleMaps";
import { darkMapStyles, lightMapStyles } from "@/lib/mapStyles";
import { getRainViewerFrames } from "@/lib/openMeteo";

/** RainViewer radar tiles only exist for zoom 0–7. */
const RADAR_MAX_ZOOM = 7;
const CITY_ZOOM = 11;

export default function WeatherMap({ location, theme }) {
  const reduceMotion = useReducedMotion();
  const { t } = useI18n();
  const mapNodeRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const radarLayerRef = useRef(null);
  const [status, setStatus] = useState("idle");
  const [errorVariant, setErrorVariant] = useState("maps");
  const [retryToken, setRetryToken] = useState(0);
  const [radarOn, setRadarOn] = useState(true);
  const [radarPath, setRadarPath] = useState(null);
  const [radarHost, setRadarHost] = useState("https://tilecache.rainviewer.com");
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    const controller = new AbortController();

    getRainViewerFrames(controller.signal)
      .then((frames) => {
        if (frames.path) {
          setRadarPath(frames.path);
          if (frames.host) setRadarHost(frames.host);
        }
      })
      .catch(() => {
        // Radar is optional — map still works without it
      });

    return () => controller.abort();
  }, [location?.latitude, location?.longitude]);

  useEffect(() => {
    if (!location) return undefined;

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
        if (cancelled || !mapNodeRef.current || !window.google?.maps) {
          return;
        }

        const center = {
          lat: Number(location.latitude),
          lng: Number(location.longitude),
        };

        const styles = theme === "dark" ? darkMapStyles : lightMapStyles;
        const initialZoom = radarOn ? RADAR_MAX_ZOOM : CITY_ZOOM;

        if (!mapRef.current) {
          mapRef.current = new window.google.maps.Map(mapNodeRef.current, {
            center,
            zoom: initialZoom,
            disableDefaultUI: true,
            zoomControl: true,
            styles,
            backgroundColor: theme === "dark" ? "#17242A" : "#F4F7F8",
          });

          markerRef.current = new window.google.maps.Marker({
            position: center,
            map: mapRef.current,
            title: location.name,
          });
        } else {
          mapRef.current.setOptions({ styles });
          mapRef.current.panTo(center);
          markerRef.current?.setPosition(center);
          markerRef.current?.setTitle(location.name);
        }

        if (!cancelled) setStatus("ready");
      } catch {
        resetGoogleMapsLoader();
        mapRef.current = null;
        markerRef.current = null;
        radarLayerRef.current = null;
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
    // radarOn only affects initial zoom for a fresh map instance
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, theme, apiKey, retryToken]);

  // RainViewer radar tile overlay (native zoom 0–7 only)
  useEffect(() => {
    if (status !== "ready" || !mapRef.current || !window.google?.maps) {
      return undefined;
    }

    clearOverlayMapType(mapRef.current, radarLayerRef);

    if (!radarOn || !radarPath) {
      // Restore closer city zoom when radar is off
      if (mapRef.current.getZoom() <= RADAR_MAX_ZOOM) {
        mapRef.current.setZoom(CITY_ZOOM);
      }
      return undefined;
    }

    // Stay within RainViewer-supported zoom so tiles never 404 with
    // "Zoom Level Not Supported"
    if (mapRef.current.getZoom() > RADAR_MAX_ZOOM) {
      mapRef.current.setZoom(RADAR_MAX_ZOOM);
    }

    const host = radarHost.replace(/\/$/, "");
    const path = radarPath;

    try {
      const layer = new window.google.maps.ImageMapType({
        getTileUrl(coord, zoom) {
          if (zoom > RADAR_MAX_ZOOM || zoom < 1) {
            return "";
          }

          const tileCount = 2 ** zoom;
          if (
            coord.x < 0 ||
            coord.y < 0 ||
            coord.x >= tileCount ||
            coord.y >= tileCount
          ) {
            return "";
          }

          return `${host}${path}/256/${zoom}/${coord.x}/${coord.y}/2/1_1.png`;
        },
        tileSize: new window.google.maps.Size(256, 256),
        maxZoom: RADAR_MAX_ZOOM,
        minZoom: 1,
        name: "Rain radar",
        opacity: 0.65,
      });

      radarLayerRef.current = layer;
      mapRef.current.overlayMapTypes.push(layer);

      // If the user zooms past radar support while radar is on, pull back
      const zoomListener = mapRef.current.addListener("zoom_changed", () => {
        if (!radarOn || !mapRef.current) return;
        const zoom = mapRef.current.getZoom();
        if (zoom > RADAR_MAX_ZOOM) {
          mapRef.current.setZoom(RADAR_MAX_ZOOM);
        }
      });

      return () => {
        if (zoomListener) {
          window.google.maps.event.removeListener(zoomListener);
        }
        clearOverlayMapType(mapRef.current, radarLayerRef);
      };
    } catch {
      return undefined;
    }
  }, [status, radarOn, radarPath, radarHost, location]);

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.12 }}
      className="card-surface overflow-hidden"
      aria-label="Location map"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sky/20 px-5 py-4 dark:border-white/8">
        <div>
          <h2 className="text-lg font-semibold text-text dark:text-text-dark">
            {t("Location map")}
          </h2>
          <p className="text-sm text-muted-soft">
            {location
              ? `${location.name}${location.country ? `, ${location.country}` : ""}`
              : t("Selected city")}
            {radarOn && status === "ready" ? ` · ${t("Radar zoom limited")}` : ""}
          </p>
        </div>
        {status === "ready" ? (
          <button
            type="button"
            aria-pressed={radarOn}
            onClick={() => setRadarOn((value) => !value)}
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition ${
              radarOn
                ? "border-primary/40 bg-primary/10 text-primary dark:text-sky"
                : "border-sky/40 text-muted hover:text-text dark:border-white/10 dark:hover:text-text-dark"
            }`}
          >
            <CloudRain size={16} aria-hidden />
            {radarOn ? t("Rain radar on") : t("Rain radar off")}
          </button>
        ) : null}
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
        <div className="relative h-64 w-full sm:h-80">
          {(status === "loading" || status === "idle") && (
            <div className="absolute inset-0 z-10 animate-pulse bg-sky/20 dark:bg-white/8" />
          )}
          <div
            ref={mapNodeRef}
            className="h-full w-full"
            role="img"
            aria-label={
              location
                ? `Map showing ${location.name}`
                : "Map of selected location"
            }
          />
        </div>
      )}
    </motion.section>
  );
}
