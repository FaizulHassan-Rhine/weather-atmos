"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import Header from "@/components/ui/Header";
import WeatherDashboard from "@/components/dashboard/WeatherDashboard";
import DisasterDashboard from "@/components/disaster/DisasterDashboard";
import AirQualityDashboard from "@/components/air/AirQualityDashboard";
import useFavorites from "@/hooks/useFavorites";
import useGeolocation from "@/hooks/useGeolocation";
import useLocalStorage from "@/hooks/useLocalStorage";
import useRecentSearches from "@/hooks/useRecentSearches";
import useTheme from "@/hooks/useTheme";
import { I18nProvider, useI18n } from "@/hooks/useI18n";
import { DHAKA, reverseGeocode } from "@/lib/openMeteo";
import { cityFromSearchParams, cityToSearchParams } from "@/lib/share";

const VALID_VIEWS = new Set(["weather", "earthquakes", "disasters", "air"]);

function resolveView(raw) {
  if (raw === "earthquakes") return "disasters";
  return VALID_VIEWS.has(raw) ? raw : "weather";
}

export default function AtmosApp() {
  const [language, setLanguage] = useLocalStorage("atmos-language", "en");

  return (
    <I18nProvider language={language || "en"}>
      <AtmosAppInner language={language || "en"} setLanguage={setLanguage} />
    </I18nProvider>
  );
}

function AtmosAppInner({ language, setLanguage }) {
  const reduceMotion = useReducedMotion();
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { theme, toggleTheme } = useTheme();
  const [unit, setUnit] = useLocalStorage("atmos-unit", "c");
  const [, setStoredView] = useLocalStorage("atmos-view", "weather");
  const [location, setLocation, locationHydrated] = useLocalStorage(
    "atmos-last-city",
    null
  );

  const [bootstrapped, setBootstrapped] = useState(false);
  const [geoNotice, setGeoNotice] = useState(null);
  const [locating, setLocating] = useState(false);

  const {
    favorites,
    isFavorite,
    toggleFavorite,
    removeFavorite,
  } = useFavorites();
  const {
    recentSearches,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
  } = useRecentSearches();
  const { requestLocation } = useGeolocation();

  const viewFromUrl = searchParams.get("view");
  const view = resolveView(viewFromUrl);

  const syncUrl = useCallback(
    (city, nextView = view) => {
      if (typeof window === "undefined") return;
      const params = city ? cityToSearchParams(city) : new URLSearchParams();
      if (nextView && nextView !== "weather") {
        params.set("view", nextView === "earthquakes" ? "disasters" : nextView);
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, view]
  );

  const setView = useCallback(
    (nextView) => {
      if (!VALID_VIEWS.has(nextView)) return;
      setStoredView(nextView);
      syncUrl(location, nextView);
    },
    [location, setStoredView, syncUrl]
  );

  const selectCity = useCallback(
    (city, { sync = true } = {}) => {
      if (!city) return;
      const next = {
        id: city.id,
        name: city.name,
        admin1: city.admin1 ?? "",
        country: city.country ?? "",
        countryCode: city.countryCode ?? "",
        latitude: city.latitude,
        longitude: city.longitude,
        timezone: city.timezone ?? "auto",
      };
      setLocation(next);
      setGeoNotice(null);
      if (sync) syncUrl(next, view);
    },
    [setLocation, syncUrl, view]
  );

  const resolveAndSelectCoords = useCallback(
    async (coords, { sync = true } = {}) => {
      try {
        const place = await reverseGeocode(coords, undefined, language);
        selectCity(place, { sync });
        return place;
      } catch {
        selectCity(
          {
            id: `geo-${coords.latitude.toFixed(4)}-${coords.longitude.toFixed(4)}`,
            name: "Current location",
            admin1: "",
            country: "",
            latitude: coords.latitude,
            longitude: coords.longitude,
            timezone: "auto",
          },
          { sync }
        );
        return null;
      }
    },
    [language, selectCity]
  );

  const useMyLocation = useCallback(async () => {
    setLocating(true);
    setGeoNotice(null);
    try {
      const coords = await requestLocation();
      await resolveAndSelectCoords(coords);
    } catch (err) {
      setGeoNotice(err.message || "Location permission was denied.");
      if (!location) selectCity(DHAKA);
    } finally {
      setLocating(false);
    }
  }, [location, requestLocation, resolveAndSelectCoords, selectCity]);

  // Re-resolve place labels when search language changes
  useEffect(() => {
    if (!bootstrapped || !location?.latitude) return undefined;
    let cancelled = false;

    reverseGeocode(location, undefined, language)
      .then((place) => {
        if (cancelled || !place?.name) return;
        if (
          place.name === location.name &&
          place.country === location.country &&
          place.admin1 === location.admin1
        ) {
          return;
        }
        selectCity(
          {
            ...location,
            name: place.name,
            admin1: place.admin1 || location.admin1,
            country: place.country || location.country,
            countryCode: place.countryCode || location.countryCode,
          },
          { sync: true }
        );
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // Bootstrap location + view
  useEffect(() => {
    if (!locationHydrated || bootstrapped) return;

    async function bootstrap() {
      if (VALID_VIEWS.has(viewFromUrl)) {
        setStoredView(resolveView(viewFromUrl));
      }

      const fromUrl = cityFromSearchParams(searchParams);
      if (fromUrl) {
        selectCity(fromUrl, { sync: false });
        syncUrl(fromUrl, resolveView(viewFromUrl));
        setBootstrapped(true);
        return;
      }

      if (location) {
        syncUrl(location, resolveView(viewFromUrl));
        setBootstrapped(true);
        return;
      }

      setLocating(true);
      try {
        const coords = await requestLocation();
        await resolveAndSelectCoords(coords);
      } catch {
        selectCity(DHAKA);
      } finally {
        setLocating(false);
        setBootstrapped(true);
      }
    }

    bootstrap();
  }, [
    bootstrapped,
    location,
    locationHydrated,
    requestLocation,
    resolveAndSelectCoords,
    searchParams,
    selectCity,
    setStoredView,
    syncUrl,
    viewFromUrl,
  ]);

  // Browser back/forward for city share links
  useEffect(() => {
    if (!bootstrapped) return;
    const fromUrl = cityFromSearchParams(searchParams);
    if (!fromUrl) return;

    const same =
      location &&
      Math.abs(location.latitude - fromUrl.latitude) < 0.0001 &&
      Math.abs(location.longitude - fromUrl.longitude) < 0.0001;

    if (!same) selectCity(fromUrl, { sync: false });
  }, [bootstrapped, location, searchParams, selectCity]);

  const showSearch =
    view === "weather" || view === "air" || view === "disasters";

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <DecorativeBackground reduceMotion={reduceMotion} />

      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        unit={unit}
        onUnitChange={setUnit}
        onSelectCity={selectCity}
        onSelectCityFromSearch={(city) => {
          selectCity(city);
          addRecentSearch(city);
        }}
        onUseLocation={useMyLocation}
        locating={locating}
        favorites={favorites}
        currentCity={location}
        isFavorite={isFavorite}
        onToggleFavorite={toggleFavorite}
        onRemoveFavorite={removeFavorite}
        language={language}
        onLanguageChange={setLanguage}
        view={view}
        onViewChange={setView}
        showSearch={showSearch}
        recentSearches={recentSearches}
        onSelectRecent={selectCity}
        onRemoveRecent={removeRecentSearch}
        onClearRecent={clearRecentSearches}
      />

      <main className="relative mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {geoNotice ? (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-accent/40 bg-accent/15 px-4 py-3 text-sm text-text dark:text-text-dark"
            role="status"
          >
            {t(geoNotice)} {t("Showing your last city or Dhaka instead.")}
          </motion.div>
        ) : null}

        {view === "weather" ? (
          <WeatherDashboard
            location={location}
            unit={unit}
            theme={theme}
            favorites={favorites}
            selectCity={selectCity}
            bootstrapped={bootstrapped}
            locating={locating}
          />
        ) : null}

        {view === "disasters" ? (
          <DisasterDashboard
            location={location}
            theme={theme}
            favorites={favorites}
            selectCity={selectCity}
            bootstrapped={bootstrapped}
          />
        ) : null}

        {view === "air" ? (
          <AirQualityDashboard
            location={location}
            unit={unit}
            favorites={favorites}
            selectCity={selectCity}
            bootstrapped={bootstrapped}
            locating={locating}
          />
        ) : null}
      </main>

      <footer className="relative mx-auto max-w-7xl px-4 pb-10 pt-2 text-center text-xs text-muted-soft sm:px-6 lg:px-8">
        {view === "disasters" ? (
          <>
            Disaster data by{" "}
            <a
              href="https://earthquake.usgs.gov/"
              target="_blank"
              rel="noreferrer"
              className="underline decoration-sky/60 underline-offset-2 transition hover:text-primary"
            >
              USGS
            </a>
            ,{" "}
            <a
              href="https://eonet.gsfc.nasa.gov/"
              target="_blank"
              rel="noreferrer"
              className="underline decoration-sky/60 underline-offset-2 transition hover:text-primary"
            >
              NASA EONET
            </a>
            , and{" "}
            <a
              href="https://www.weather.gov/"
              target="_blank"
              rel="noreferrer"
              className="underline decoration-sky/60 underline-offset-2 transition hover:text-primary"
            >
              NOAA
            </a>
            . Maps by Google when configured.
          </>
        ) : (
          <>
            Weather & air quality by{" "}
            <a
              href="https://open-meteo.com/"
              target="_blank"
              rel="noreferrer"
              className="underline decoration-sky/60 underline-offset-2 transition hover:text-primary"
            >
              Open-Meteo
            </a>
            {view === "weather" ? (
              <>
                . Rain radar by{" "}
                <a
                  href="https://www.rainviewer.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="underline decoration-sky/60 underline-offset-2 transition hover:text-primary"
                >
                  RainViewer
                </a>
              </>
            ) : null}
            . Maps by Google when configured.
          </>
        )}
      </footer>
    </div>
  );
}

function DecorativeBackground({ reduceMotion }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-mint/50 blur-3xl dark:bg-primary/15"
        animate={
          reduceMotion
            ? undefined
            : { x: [0, 30, 0], y: [0, 20, 0] }
        }
        transition={
          reduceMotion
            ? undefined
            : { duration: 18, repeat: Infinity, ease: "easeInOut" }
        }
      />
      <motion.div
        className="absolute -right-20 top-40 h-80 w-80 rounded-full bg-sky/40 blur-3xl dark:bg-secondary/15"
        animate={
          reduceMotion
            ? undefined
            : { x: [0, -25, 0], y: [0, 30, 0] }
        }
        transition={
          reduceMotion
            ? undefined
            : { duration: 22, repeat: Infinity, ease: "easeInOut" }
        }
      />
      <motion.div
        className="absolute bottom-10 left-1/3 h-64 w-64 rounded-full bg-accent/20 blur-3xl dark:bg-accent/10"
        animate={
          reduceMotion
            ? undefined
            : { x: [0, 20, 0], y: [0, -18, 0] }
        }
        transition={
          reduceMotion
            ? undefined
            : { duration: 20, repeat: Infinity, ease: "easeInOut" }
        }
      />
    </div>
  );
}
