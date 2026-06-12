"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ReactElement } from "react";
import { useErrorList } from "@/entities/error/api/getErrorList";
import { useEventStats } from "@/entities/event/api/getEventStats";
import {
  calcChangeRate,
  getPeakLabel,
} from "@/entities/event/model/eventStatsUtils";
import { getEventLabel } from "@/shared/config/eventLabel";
import StatusBadge from "@/shared/ui/StatusBadge";
import ClassificationBadge from "@/shared/ui/ClassificationBadge";
import ChangeRateBadge from "@/shared/ui/ChangeRateBadge";
import InsightLabel from "@/shared/ui/InsightLabel";
import PeriodSelector from "@/shared/ui/PeriodSelector";
import DropIcon from "@/shared/ui/icons/DropIcon";
import LiftIcon from "@/shared/ui/icons/LiftIcon";
import ErrorTimeChart from "@/views/sentry/ErrorTimeChart";
import dayjs from "@/shared/lib/dayjs";
import { cn } from "@/shared/lib/utils";
import { apiClient } from "@/shared/api/client";
import { useQuery } from "@tanstack/react-query";
import type {
  SentryIssue,
  ErrorStatsPeriod,
  ErrorStatPoint,
} from "@/entities/error/model/errorStats";
import type {
  EventStats,
  Period as EventPeriod,
} from "@/entities/event/model/eventStats";

// 에러 카드 컴포넌트
interface ErrorTopCardProps {
  issue: SentryIssue;
}

const ErrorTopCard = ({ issue }: ErrorTopCardProps): ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleCardClick = (): void => {
    router.push(`/dashboard/errors/${issue.id}`);
  };

  return (
    <div className="rounded-xl border border-border-base bg-bg-base overflow-hidden flex flex-col">
      <button
        type="button"
        onClick={handleCardClick}
        className="w-full p-4 flex flex-col gap-2 text-left hover:bg-bg-hover transition-colors flex-1 min-h-30"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClassificationBadge
              variant={issue.isUnhandled ? "critical" : "new"}
            />
            <p className="text-body2 font-medium text-text-primary font-mono">
              {issue.title}
            </p>
          </div>
          <StatusBadge variant={issue.status} />
        </div>
        <p className="text-caption text-text-secondary">
          발생:{" "}
          <span className="font-medium">
            {Number(issue.count).toLocaleString()}회
          </span>
          {" · "}영향 사용자:{" "}
          <span className="font-medium">
            {issue.userCount.toLocaleString()}명
          </span>
          {" · "}최초: {dayjs(issue.firstSeen).format("MM/DD")}
          {" · "}마지막: {dayjs(issue.lastSeen).format("MM/DD HH:mm")}
        </p>
        <p className="text-caption text-text-tertiary">{issue.culprit}</p>
      </button>

      {isOpen && (
        <div className="px-4 pb-3 flex flex-col gap-2">
          <InsightLabel
            variant="fact"
            text={`${issue.title} 에러가 ${Number(issue.count).toLocaleString()}회 발생했습니다.`}
          />
          <InsightLabel
            variant="comparison"
            text="최근 발생 추이를 확인하고 이전 배포 시점과 비교해보세요."
          />
          <InsightLabel
            variant="action"
            text={`${issue.culprit} 파일을 확인하고 관련 코드를 점검하세요.`}
          />
        </div>
      )}

      <div className="flex items-center justify-between px-4 py-2">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center gap-1 text-caption text-text-tertiary hover:text-text-secondary transition-colors"
        >
          {isOpen ? (
            <LiftIcon color="var(--color-text-tertiary)" />
          ) : (
            <DropIcon color="var(--color-text-tertiary)" />
          )}
          <span>{isOpen ? "해석 숨기기" : "해석 보기"}</span>
        </button>
        <a
          href={issue.permalink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-caption text-text-tertiary hover:text-text-secondary"
        >
          Sentry에서 보기↗
        </a>
      </div>
    </div>
  );
};

// 이벤트 카드 컴포넌트
interface EventTopCardProps {
  event: EventStats;
}

const EventTopCard = ({ event }: EventTopCardProps): ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const label = getEventLabel(event.event);
  const changeRate = calcChangeRate(event.currentTotal, event.previousTotal);
  const peakLabel = getPeakLabel(event.breakdown);

  const handleCardClick = (): void => {
    router.push(`/dashboard/events/${encodeURIComponent(event.event)}`);
  };

  return (
    <div className="rounded-xl border border-border-base bg-bg-base overflow-hidden flex flex-col">
      <button
        type="button"
        onClick={handleCardClick}
        className="w-full p-4 flex flex-col gap-2 text-left hover:bg-bg-hover transition-colors flex-1 min-h-30"
      >
        <div className="flex items-center justify-between">
          <p className="text-body2 font-medium text-text-primary">{label}</p>
          <ChangeRateBadge value={changeRate} />
        </div>
        <p className="text-caption text-text-tertiary">{event.event}</p>
        <p className="text-caption text-text-secondary">
          발생:{" "}
          <span className="font-medium">
            {event.currentTotal.toLocaleString()}회
          </span>
          {" · "}이전:{" "}
          <span className="font-medium">
            {event.previousTotal.toLocaleString()}회
          </span>
          {" · "}피크: <span className="font-medium">{peakLabel}</span>
        </p>
      </button>

      {isOpen && (
        <div className="px-4 pb-3 flex flex-col gap-2">
          <InsightLabel
            variant="fact"
            text={`${label} 이벤트가 ${event.currentTotal.toLocaleString()}회 발생했습니다.`}
          />
          <InsightLabel
            variant="comparison"
            text={`이전 기간 대비 ${changeRate > 0 ? "증가" : changeRate < 0 ? "감소" : "동일"}했습니다.`}
          />
          <InsightLabel
            variant="action"
            text="이벤트 추이를 확인하고 비정상 패턴이 있는지 점검하세요."
          />
        </div>
      )}

      <div className="flex items-center justify-between px-4 py-2">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center gap-1 text-caption text-text-tertiary hover:text-text-secondary transition-colors"
        >
          {isOpen ? (
            <LiftIcon color="var(--color-text-tertiary)" />
          ) : (
            <DropIcon color="var(--color-text-tertiary)" />
          )}
          <span>{isOpen ? "해석 숨기기" : "해석 보기"}</span>
        </button>
        <span className="text-caption text-text-tertiary">
          PostHog에서 보기↗
        </span>
      </div>
    </div>
  );
};

// 발생 추이 차트
const PERIOD_MAP: Record<"오늘" | "7일" | "30일", ErrorStatsPeriod> = {
  오늘: "24h",
  "7일": "7d",
  "30일": "30d",
};

const EVENT_PERIOD_MAP: Record<"오늘" | "7일" | "30일", EventPeriod> = {
  오늘: "day",
  "7일": "week",
  "30일": "month",
};

interface OverviewChartProps {
  type: "error" | "event";
  period: "오늘" | "7일" | "30일";
}

const OverviewChart = ({ type, period }: OverviewChartProps): ReactElement => {
  const errorPeriod = PERIOD_MAP[period];
  const eventPeriod = EVENT_PERIOD_MAP[period];

  const { data: errorStats, isLoading: errorLoading } = useQuery({
    queryKey: ["sentry", "overview-stats", errorPeriod],
    queryFn: async () => {
      const res = await apiClient(`/api/sentry/stats?period=${errorPeriod}`);
      if (!res.ok) throw new Error("에러 통계 조회 실패");
      return res.json() as Promise<{ period: string; stats: ErrorStatPoint[] }>;
    },
    enabled: type === "error",
  });

  const { data: eventStats, isLoading: eventLoading } =
    useEventStats(eventPeriod);

  if (type === "error") {
    if (errorLoading)
      return (
        <p className="text-caption text-text-tertiary py-8 text-center">
          로딩 중...
        </p>
      );
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
    return (
      <p className="text-body2 text-text-tertiary py-8 text-center">
        데이터가 없습니다
      </p>
    );
  }

  if (eventLoading)
    return (
      <p className="text-caption text-text-tertiary py-8 text-center">
        로딩 중...
      </p>
    );
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
  return (
    <p className="text-body2 text-text-tertiary py-8 text-center">
      데이터가 없습니다
    </p>
  );
};

// 메인 대시보드
const MainDashboard = (): ReactElement => {
  const [chartType, setChartType] = useState<"error" | "event">("error");
  const [chartPeriod, setChartPeriod] = useState<"오늘" | "7일" | "30일">(
    "오늘",
  );

  const { data: errorData, isLoading: errorLoading } = useErrorList({
    status: "unresolved",
  });
  const { data: eventData, isLoading: eventLoading } = useEventStats("week");
  const { data: eventDataMonth } = useEventStats("month");

  const topErrors = errorData?.issues.slice(0, 3) ?? [];
  const topEvents = (
    eventData?.events && eventData.events.length > 0
      ? eventData.events
      : (eventDataMonth?.events ?? [])
  ).slice(0, 3);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-h1 font-bold text-text-primary">개요</h1>
        <p className="text-body2 text-text-secondary mt-1">
          오늘의 서비스 상태를 확인하세요.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="flex flex-col gap-3">
          <h2 className="text-body1 font-medium text-text-primary">
            에러 Top 3
          </h2>
          {errorLoading && (
            <p className="text-caption text-text-tertiary py-4">로딩 중...</p>
          )}
          {topErrors.map((issue) => (
            <ErrorTopCard key={issue.id} issue={issue} />
          ))}
          {!errorLoading && topErrors.length === 0 && (
            <p className="text-body2 text-text-tertiary py-8 text-center">
              에러가 없습니다
            </p>
          )}
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-body1 font-medium text-text-primary">
            이벤트 Top 3
          </h2>
          {eventLoading && (
            <p className="text-caption text-text-tertiary py-4">로딩 중...</p>
          )}
          {topEvents.map((ev) => (
            <EventTopCard key={ev.event} event={ev} />
          ))}
          {!eventLoading && topEvents.length === 0 && (
            <p className="text-body2 text-text-tertiary py-8 text-center">
              이벤트가 없습니다
            </p>
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
    </div>
  );
};

export default MainDashboard;
