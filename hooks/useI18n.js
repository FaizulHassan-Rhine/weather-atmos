"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { LoaderCircle } from "lucide-react";
import { UI_STRINGS } from "@/lib/uiStrings";

const I18nContext = createContext({
  language: "en",
  t: (text) => text,
  ready: true,
  translating: false,
});

const CACHE_PREFIX = "atmos-gtx-cache:";

function readCache(language) {
  if (typeof window === "undefined" || language === "en") return {};
  try {
    const raw = window.localStorage.getItem(`${CACHE_PREFIX}${language}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeCache(language, map) {
  if (typeof window === "undefined" || language === "en") return;
  try {
    window.localStorage.setItem(
      `${CACHE_PREFIX}${language}`,
      JSON.stringify(map)
    );
  } catch {
    // ignore quota errors
  }
}

function cacheIsComplete(cached) {
  if (!cached || typeof cached !== "object") return false;
  // Require most UI strings so we can swap the page in one shot
  const hits = UI_STRINGS.filter((text) => Boolean(cached[text])).length;
  return hits >= UI_STRINGS.length * 0.95;
}

async function fetchTranslations(texts, language) {
  // Chunk requests so the server can parallelize without huge payloads
  const chunkSize = 40;
  const chunks = [];
  for (let i = 0; i < texts.length; i += chunkSize) {
    chunks.push(texts.slice(i, i + chunkSize));
  }

  const merged = {};
  await Promise.all(
    chunks.map(async (chunk) => {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texts: chunk,
          target: language,
          source: "en",
        }),
      });
      const data = await response.json();
      Object.assign(merged, data.translations || {});
    })
  );
  return merged;
}

function LanguageLoader({ visible }) {
  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-bg/75 backdrop-blur-sm dark:bg-dark-bg/80"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="card-surface flex min-w-[16rem] flex-col items-center gap-4 px-8 py-7 text-center shadow-[var(--shadow-soft)]">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary dark:bg-primary/25 dark:text-sky">
          <LoaderCircle size={24} className="animate-spin" aria-hidden />
        </span>
        <div>
          <p className="text-base font-semibold text-text dark:text-text-dark">
            Translating…
          </p>
          <p className="mt-1 text-sm text-muted-soft">
            Updating the whole page
          </p>
        </div>
      </div>
    </div>
  );
}

export function I18nProvider({ language = "en", children }) {
  // Active = language currently applied to the UI (swapped only when ready)
  const [activeLanguage, setActiveLanguage] = useState(language || "en");
  const [dict, setDict] = useState({});
  const [translating, setTranslating] = useState(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const target = language || "en";
    const requestId = ++requestIdRef.current;

    async function load() {
      // Already showing this language — nothing to do
      if (target === activeLanguage && (target === "en" || cacheIsComplete(dict))) {
        setTranslating(false);
        return;
      }

      if (target === "en") {
        setTranslating(true);
        // Brief tick so the loader is visible on fast switches too
        await Promise.resolve();
        if (cancelled || requestId !== requestIdRef.current) return;
        setDict({});
        setActiveLanguage("en");
        setTranslating(false);
        return;
      }

      setTranslating(true);

      const cached = readCache(target);
      const missing = UI_STRINGS.filter((text) => !cached[text]);

      try {
        let next = cached;

        if (missing.length) {
          const translations = await fetchTranslations(missing, target);
          if (cancelled || requestId !== requestIdRef.current) return;
          next = { ...cached, ...translations };
          writeCache(target, next);
        } else {
          // Allow paint of loader before instant cache swap
          await new Promise((resolve) => setTimeout(resolve, 180));
        }

        if (cancelled || requestId !== requestIdRef.current) return;

        // Atomic swap: dictionary + language together
        setDict(next);
        setActiveLanguage(target);
      } catch {
        if (cancelled || requestId !== requestIdRef.current) return;
        // Fall back to whatever we have rather than hanging on the loader
        if (cacheIsComplete(cached)) {
          setDict(cached);
          setActiveLanguage(target);
        }
      } finally {
        if (!cancelled && requestId === requestIdRef.current) {
          setTranslating(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // Intentionally depend on requested language only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const t = useCallback(
    (text, fallback) => {
      if (!text) return fallback ?? "";
      if (!activeLanguage || activeLanguage === "en") return text;
      return dict[text] ?? fallback ?? text;
    },
    [activeLanguage, dict]
  );

  const value = useMemo(
    () => ({
      language: activeLanguage,
      requestedLanguage: language,
      t,
      ready: !translating,
      translating,
    }),
    [activeLanguage, language, t, translating]
  );

  return (
    <I18nContext.Provider value={value}>
      {children}
      <LanguageLoader visible={translating} />
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

export default useI18n;
