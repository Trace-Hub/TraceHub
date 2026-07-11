"use client";

import { useState } from "react";
import type { ReactElement } from "react";
import { useErrorList } from "@/entities/error/api/getErrorList";
import { useEventStats } from "@/entities/event/api/getEventStats";
import ErrorCard from "@/shared/ui/ErrorCard";
import EmptyState from "@/shared/ui/EmptyState";
import PeriodSelector from "@/shared/ui/PeriodSelector";
import type { Period } from "@/shared/ui/PeriodTab";
import EventTopCard from "@/views/dashboard/EventTopCard";
import OverviewChart from "@/views/dashboard/OverviewChart";
import MainDashboardSkeleton from "@/views/dashboard/MainDashboardSkeleton";
import useConnectionCheck from "@/shared/hooks/useConnectionCheck";
import { cn } from "@/shared/lib/utils";

const MainDashboard = (): ReactElement => {
  useConnectionCheck();

  const [chartType, setChartType] = useState<"error" | "event">("error");
  const [chartPeriod, setChartPeriod] = useState<Period>("오늘");

  const { data: errorData, isLoading: errorLoading } = useErrorList({
    status: "unresolved",
  });
  const { data: eventData, isLoading: eventLoading } = useEventStats("week");
  const { data: eventDataMonth, isLoading: eventMonthLoading } =
    useEventStats("month");

  const topErrors = errorData?.issues.slice(0, 3) ?? [];
  const topEvents = (
    eventData?.events && eventData.events.length > 0
      ? eventData.events
      : (eventDataMonth?.events ?? [])
  ).slice(0, 3);

  const isInitialLoading = errorLoading || eventLoading || eventMonthLoading;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-h1 font-bold text-text-primary">Overview</h1>
        <p className="text-body2 text-text-secondary mt-1">
          오늘의 서비스 상태를 확인하세요.
        </p>
      </div>

      {isInitialLoading && <MainDashboardSkeleton />}

      {!isInitialLoading && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="flex flex-col gap-3">
              <h2 className="text-body1 font-medium text-text-primary">
                에러 Top 3
              </h2>
              {topErrors.map((issue) => (
                <ErrorCard
                  key={issue.id}
                  issue={issue}
                  minHeightClass="min-h-30"
                />
              ))}
              {!errorLoading && topErrors.length === 0 && (
                <EmptyState message="에러가 없습니다" />
              )}
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-body1 font-medium text-text-primary">
                이벤트 Top 3
              </h2>
              {topEvents.map((ev) => (
                <EventTopCard key={ev.event} event={ev} />
              ))}
              {!eventLoading && topEvents.length === 0 && (
                <EmptyState message="이벤트가 없습니다" />
              )}
            </section>
          </div>

          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setChartType("error")}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-body2 font-medium transition-colors",
                    chartType === "error"
                      ? "bg-error text-white"
                      : "text-text-secondary hover:text-text-primary border border-border-base",
                  )}
                >
                  에러
                </button>
                <button
                  type="button"
                  onClick={() => setChartType("event")}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-body2 font-medium transition-colors",
                    chartType === "event"
                      ? "bg-primary text-white"
                      : "text-text-secondary hover:text-text-primary border border-border-base",
                  )}
                >
                  이벤트
                </button>
              </div>
              <PeriodSelector value={chartPeriod} onChange={setChartPeriod} />
            </div>
            <h3 className="text-body2 font-medium text-text-primary">
              {chartType === "error" ? "에러 발생 추이" : "이벤트 발생 추이"}
            </h3>
            <OverviewChart type={chartType} period={chartPeriod} />
          </section>
        </>
      )}
    </div>
  );
};

export default MainDashboard;
