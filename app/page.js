import { Suspense } from "react";
import AtmosApp from "@/components/AtmosApp";
import {
  CurrentWeatherSkeleton,
  HourlySkeleton,
  MetricsSkeleton,
  WeeklySkeleton,
} from "@/components/ui/LoadingSkeleton";

function DashboardFallback() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <CurrentWeatherSkeleton />
      <MetricsSkeleton />
      <HourlySkeleton />
      <WeeklySkeleton />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <AtmosApp />
    </Suspense>
  );
}
