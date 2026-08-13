"use client";

import { useId } from "react";
import { MoonStar, Sun } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/hooks/useI18n";
import { formatDuration } from "@/lib/sun";

export default function DayNightCircle({ split }) {
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();
  const uid = useId();
  const glowId = `${uid}-day-glow`;
  const dayGradId = `${uid}-day`;
  const nightGradId = `${uid}-night`;

  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const dayLength = Math.max(8, (split.dayPercent / 100) * circumference);
  const nightLength = Math.max(8, circumference - dayLength);

  return (
    <div className="flex flex-col items-center rounded-3xl bg-gradient-to-b from-accent/20 via-surface/90 to-sky/20 px-4 py-6 shadow-[var(--shadow-soft)] dark:from-accent/10 dark:via-dark-surface dark:to-secondary/15">
      <p className="text-sm font-medium text-muted-soft">{t("Day vs night")}</p>

      <div className="relative mt-5 flex h-44 w-44 items-center justify-center">
        <motion.div
          aria-hidden
          className="absolute h-36 w-36 rounded-full bg-accent/30 blur-3xl dark:bg-accent/15"
          animate={
            reduceMotion ? undefined : { opacity: [0.35, 0.65, 0.35] }
          }
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        <svg
          viewBox="0 0 100 100"
          className="relative h-40 w-40"
          role="img"
          aria-label={`${t("Daylight")} ${formatDuration(split.daySeconds)}, ${t("Night")} ${formatDuration(split.nightSeconds)}`}
        >
          <defs>
            <linearGradient id={dayGradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f6e7c4" />
              <stop offset="50%" stopColor="#e7b98d" />
              <stop offset="100%" stopColor="#f0d3a2" />
            </linearGradient>
            <linearGradient id={nightGradId} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8fb0c8" />
              <stop offset="100%" stopColor="#6f92b5" />
            </linearGradient>
            <filter id={glowId} x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="2.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <circle cx="50" cy="50" r="42" className="fill-mint/40 dark:fill-white/5" />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={`url(#${nightGradId})`}
            strokeWidth="11"
            strokeLinecap="round"
            strokeDasharray={`${nightLength} ${circumference}`}
            transform={`rotate(${split.sunsetAngle - 90} 50 50)`}
            className="opacity-80 dark:opacity-70"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={`url(#${dayGradId})`}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${dayLength} ${circumference}`}
            transform={`rotate(${split.sunriseAngle - 90} 50 50)`}
            filter={`url(#${glowId})`}
          />
          <circle
            cx="50"
            cy="50"
            r="24"
            className="fill-surface/90 dark:fill-dark-surface/90"
          />
        </svg>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-2xl font-semibold tracking-tight text-text dark:text-text-dark">
            {Math.round(split.dayPercent)}%
          </p>
          <p className="text-[11px] text-muted-soft">{t("Daylight")}</p>
        </div>
      </div>

      <div className="mt-3 grid w-full max-w-[17rem] grid-cols-2 gap-2">
        <div className="rounded-2xl bg-accent/15 px-3 py-2.5 text-center dark:bg-accent/10">
          <p className="inline-flex items-center justify-center gap-1.5 text-xs text-muted-soft">
            <Sun size={13} className="text-accent" aria-hidden />
            {t("Daylight")}
          </p>
          <p className="mt-1 text-sm font-semibold text-text dark:text-text-dark">
            {formatDuration(split.daySeconds)}
          </p>
        </div>
        <div className="rounded-2xl bg-secondary/15 px-3 py-2.5 text-center dark:bg-secondary/15">
          <p className="inline-flex items-center justify-center gap-1.5 text-xs text-muted-soft">
            <MoonStar size={13} className="text-secondary dark:text-sky" aria-hidden />
            {t("Night")}
          </p>
          <p className="mt-1 text-sm font-semibold text-text dark:text-text-dark">
            {formatDuration(split.nightSeconds)}
          </p>
        </div>
      </div>
    </div>
  );
}
