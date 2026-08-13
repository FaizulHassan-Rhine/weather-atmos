"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/hooks/useI18n";

export default function MoonPhaseVisual({ moon }) {
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();
  const waxing = moon.fraction <= 0.5;
  const isNew =
    moon.illuminationPercent <= 2 &&
    (moon.fraction < 0.03 || moon.fraction > 0.97);

  // Keep a readable crescent while still showing the real percent.
  const visual = isNew ? 0 : Math.max(moon.illumination, 0.16);
  const size = 128;
  const shadowX = (waxing ? -1 : 1) * visual * size;
  const litX = waxing ? "70%" : "30%";

  return (
    <div className="flex flex-col items-center rounded-3xl bg-gradient-to-b from-sky/25 via-surface/90 to-secondary/10 px-4 py-6 shadow-[var(--shadow-soft)] dark:from-secondary/20 dark:via-dark-surface dark:to-primary/10">
      <p className="text-sm font-medium text-muted-soft">
        {t("Moon illumination")}
      </p>

      <div className="relative mt-5 flex h-44 w-44 items-center justify-center">
        <motion.div
          aria-hidden
          className="absolute h-40 w-40 rounded-full bg-sky/50 blur-3xl dark:bg-secondary/30"
          animate={
            reduceMotion ? undefined : { opacity: [0.4, 0.75, 0.4] }
          }
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
        <div
          aria-hidden
          className="absolute h-24 w-24 rounded-full bg-accent/35 blur-2xl dark:bg-accent/20"
        />

        <div
          className="relative h-32 w-32 overflow-hidden rounded-full shadow-[0_12px_30px_rgba(23,37,42,0.12),inset_-8px_-10px_22px_rgba(23,37,42,0.12)] dark:shadow-[0_12px_30px_rgba(0,0,0,0.35)]"
          role="img"
          aria-label={`${t(moon.label)}, ${moon.illuminationPercent}% ${t("lit")}`}
          style={{
            background: `radial-gradient(circle at ${litX} 32%, #fffdf8 0%, #f4e7c8 38%, #d7c49a 68%, #9aa8b0 100%)`,
          }}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 38% 32%, #8ea0ad 0%, #4d5f6b 42%, #2a3942 78%, #1b272e 100%)",
              transform: `translateX(${shadowX}px)`,
              filter: "blur(3px)",
              opacity: 0.9,
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-[12%] rounded-full opacity-30 mix-blend-soft-light"
            style={{
              background: `radial-gradient(circle at ${litX} 24%, #ffffff, transparent 55%)`,
            }}
          />
        </div>
      </div>

      <p className="mt-2 text-3xl font-semibold tracking-tight text-text dark:text-text-dark">
        {moon.illuminationPercent}%
      </p>
      <p className="mt-1 text-sm font-medium text-text/80 dark:text-text-dark/80">
        {t(moon.label)}
      </p>
      <p className="mt-1 text-xs text-muted-soft">
        {t("of the moon is visible today")}
      </p>
    </div>
  );
}
