"use client";

import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/hooks/useI18n";

const GUIDANCE = {
  earthquake: {
    label: "Earthquakes",
    subtitle: "Simple safety steps for seismic events",
    sections: [
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
    ],
  },
  storm: {
    label: "Storms",
    subtitle: "Stay sheltered during severe weather and tropical cyclones",
    sections: [
      {
        title: "Before",
        items: [
          "Know your local warning system and have a battery radio or offline alerts.",
          "Bring in outdoor items and identify an interior room away from windows.",
          "Charge devices and store drinking water before a storm arrives.",
        ],
      },
      {
        title: "During",
        items: [
          "Stay indoors and avoid windows, skylights, and garage doors.",
          "Do not drive through flooded roads or underpasses.",
          "If a tornado warning is issued, move to a basement or interior windowless room.",
        ],
      },
      {
        title: "After",
        items: [
          "Watch for downed power lines, debris, and weakened trees.",
          "Use generators outdoors only and far from windows.",
          "Follow official re-entry guidance before returning to damaged areas.",
        ],
      },
    ],
  },
  wildfire: {
    label: "Wildfires",
    subtitle: "Prepare to leave early and reduce smoke exposure",
    sections: [
      {
        title: "Before",
        items: [
          "Prepare a go-bag with medicines, documents, water, and N95 masks.",
          "Clear dry vegetation near your home when it is safe to do so.",
          "Sign up for local evacuation alerts and know more than one exit route.",
        ],
      },
      {
        title: "During",
        items: [
          "Leave immediately if an evacuation order is issued — do not wait.",
          "Close windows and set HVAC to recirculate to limit smoke indoors.",
          "Avoid outdoor exertion when air is smoky, especially for children and older adults.",
        ],
      },
      {
        title: "After",
        items: [
          "Return only when officials say it is safe.",
          "Watch for hot spots, ash pits, and damaged utilities.",
          "Seek medical care if breathing difficulty continues after smoke exposure.",
        ],
      },
    ],
  },
  flood: {
    label: "Floods",
    subtitle: "Move to higher ground and never drive through floodwater",
    sections: [
      {
        title: "Before",
        items: [
          "Know nearby high ground and whether your area is in a flood plain.",
          "Move valuables and chemicals above expected water levels.",
          "Keep an emergency kit ready and plan how you would leave quickly.",
        ],
      },
      {
        title: "During",
        items: [
          "Move to higher ground immediately if flooding begins.",
          "Never walk or drive through floodwater — six inches can knock you down.",
          "Turn around if a road is covered; do not drive around barricades.",
        ],
      },
      {
        title: "After",
        items: [
          "Avoid floodwater, which can hide debris, sewage, and live wires.",
          "Document damage only when it is safe and follow boil-water notices.",
          "Check foundations, gas, and electrical systems before re-entering buildings.",
        ],
      },
    ],
  },
  emergency: {
    label: "Emergency",
    subtitle: "Follow official instructions for volcanoes, landslides, and alerts",
    sections: [
      {
        title: "Before",
        items: [
          "Keep a small kit with water, flashlight, whistle, and copies of IDs.",
          "Know official alert channels for your region and nearby hazards.",
          "Agree on a meeting place with household members if you get separated.",
        ],
      },
      {
        title: "During",
        items: [
          "Follow official evacuation or shelter-in-place instructions immediately.",
          "Stay away from landslide slopes, volcanic ash plumes, and restricted zones.",
          "Check on neighbors who may need extra help, if it is safe to do so.",
        ],
      },
      {
        title: "After",
        items: [
          "Wait for all-clear messages before returning home.",
          "Avoid ash, unstable slopes, and damaged infrastructure.",
          "Use trusted sources only — rumors spread quickly during emergencies.",
        ],
      },
    ],
  },
};

export default function DisasterGuidance({ activeType }) {
  const reduceMotion = useReducedMotion();
  const { t } = useI18n();
  const initial =
    activeType && GUIDANCE[activeType] ? activeType : "earthquake";
  const [type, setType] = useState(initial);
  const current = GUIDANCE[type] || GUIDANCE.earthquake;

  useEffect(() => {
    if (activeType && GUIDANCE[activeType]) setType(activeType);
  }, [activeType]);

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-surface p-5 sm:p-6"
      aria-label={t("Emergency guidance")}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/25 text-accent">
            <ShieldAlert size={20} aria-hidden />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-text dark:text-text-dark">
              {t("Emergency guidance")}
            </h2>
            <p className="text-sm text-muted-soft">{t(current.subtitle)}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(GUIDANCE).map(([id, item]) => (
            <button
              key={id}
              type="button"
              aria-pressed={type === id}
              onClick={() => setType(id)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
                type === id
                  ? "bg-primary text-white"
                  : "border border-sky/40 text-muted hover:text-text dark:border-white/10 dark:hover:text-text-dark"
              }`}
            >
              {t(item.label)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {current.sections.map((section) => (
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
