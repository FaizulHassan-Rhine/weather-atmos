"use client";

import { useI18n } from "@/hooks/useI18n";
import { RISK_TONE_CLASSES, getRiskInfo } from "@/lib/earthquake";

export default function RiskIndicator({ magnitude, className = "" }) {
  const { t } = useI18n();
  const risk = getRiskInfo(magnitude);
  const toneClass = RISK_TONE_CLASSES[risk.tone] || RISK_TONE_CLASSES.muted;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${toneClass} ${className}`}
    >
      {t(risk.label)}
    </span>
  );
}
