"use client";

import type { ReactElement } from "react";
import { useOverviewStats } from "@/entities/error/api/getOverviewStats";
import { useEventStats } from "@/entities/event/api/getEventStats";
import { EVENT_TAB_TO_PERIOD } from "@/entities/event/model/eventStats";
import { PERIOD_TAB_MAP } from "@/shared/config/dropdownOptions";
import type { ErrorStatPoint } from "@/entities/error/model/errorStats";
import ErrorTimeChart from "@/views/sentry/ErrorTimeChart";
import EmptyState from "@/shared/ui/EmptyState";
import Skeleton from "@/shared/ui/skeleton";
import type { Period } from "@/shared/ui/PeriodTab";

interface OverviewChartProps {
  type: "error" | "event";
  period: Period;
}

const OverviewChart = ({ type, period }: OverviewChartProps): ReactElement => {
  const errorPeriod = PERIOD_TAB_MAP[period];
  const eventPeriod = EVENT_TAB_TO_PERIOD[period];

  const { data: errorStats, isLoading: errorLoading } = useOverviewStats(
    errorPeriod,
    type === "error",
  );

  const { data: eventStats, isLoading: eventLoading } =
    useEventStats(eventPeriod);

  if (type === "error") {
    if (errorLoading) return <Skeleton className="h-36 w-full rounded-xl" />;
    if (errorStats) {
      const hasData = errorStats.stats.some((s) => s.count > 0);
      if (hasData)
        return (
          <ErrorTimeChart
            key={`error-${errorPeriod}`}
            stats={errorStats.stats}
            period={errorPeriod}
            className="h-36"
          />
        );
    }
    return <EmptyState message="데이터가 없습니다" />;
  }

  if (eventLoading) return <Skeleton className="h-36 w-full rounded-xl" />;
  if (eventStats && eventStats.events.length > 0) {
    const merged: Record<string, number> = {};
    for (const ev of eventStats.events) {
      for (const b of ev.breakdown) {
        merged[b.label] = (merged[b.label] ?? 0) + b.count;
      }
    }
    const entries = Object.entries(merged);
    const chartLabels = entries.map(([label]) => label);
    const stats: ErrorStatPoint[] = entries.map(([, count], index) => ({
      timestamp: index,
      count,
    }));
    return (
      <ErrorTimeChart
        key={`event-${errorPeriod}`}
        stats={stats}
        period={errorPeriod}
        className="h-36"
        barColor="var(--color-primary)"
        peakColor="var(--color-primary-hover)"
        labels={chartLabels}
      />
    );
  }
  return <EmptyState message="데이터가 없습니다" />;
};

export default OverviewChart;
