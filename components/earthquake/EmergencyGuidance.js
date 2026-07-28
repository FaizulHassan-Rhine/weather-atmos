"use client";

import { ShieldAlert } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/hooks/useI18n";

const SECTIONS = [
  {
    title: "Before",
    items: [
      "Secure heavy furniture and know safe spots in each room.",
      "Prepare a small emergency kit with water, flashlight, and whistle.",
      "Practice Drop, Cover, and Hold On with your household.",
    ],
  },
  {
    title: "During",
    items: [
      "Drop to the ground, take cover under sturdy furniture, and hold on.",
      "Stay away from windows, exterior walls, and falling objects.",
      "If outdoors, move to an open area away from buildings and power lines.",
    ],
  },
  {
    title: "After",
    items: [
      "Check yourself and others for injuries and hazards like gas leaks.",
      "Expect aftershocks and move carefully when exiting damaged areas.",
      "Follow official guidance and avoid coastal areas if a tsunami is possible.",
    ],
  },
];

export default function EmergencyGuidance() {
  const reduceMotion = useReducedMotion();
  const { t } = useI18n();

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-surface p-5 sm:p-6"
      aria-label={t("Emergency guidance")}
    >
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/25 text-accent">
          <ShieldAlert size={20} aria-hidden />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-text dark:text-text-dark">
            {t("Emergency guidance")}
          </h2>
          <p className="text-sm text-muted-soft">
            {t("Simple safety steps for seismic events")}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {SECTIONS.map((section) => (
          <div
            key={section.title}
            className="rounded-2xl border border-sky/20 bg-bg/50 p-4 dark:border-white/8 dark:bg-dark-bg/40"
          >
            <h3 className="text-sm font-semibold text-primary dark:text-sky">
              {t(section.title)}
            </h3>
            <ul className="mt-3 space-y-2">
              {section.items.map((item) => (
                <li
                  key={item}
                  className="flex gap-2 text-sm leading-relaxed text-muted-soft"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {t(item)}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
