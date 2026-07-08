"use client";

import { useMemo, useState } from "react";
import type { ReactElement } from "react";
import { useErrorList } from "@/entities/error/api/getErrorList";
import { getIssueClassifications } from "@/entities/error/model/errorStatsUtils";
import type { SentryIssue } from "@/entities/error/model/errorStats";
import type { ClassificationBadgeProps } from "@/shared/ui/ClassificationBadge";
import EmptyState from "@/shared/ui/EmptyState";
import Skeleton from "@/shared/ui/skeleton";
import Dropdown from "@/shared/ui/Dropdown";
import useApiErrorToast from "@/shared/hooks/useApiErrorToast";
import { CHART_COLOR_PALETTE } from "@/shared/config/chartColors";
import EventRelatedDonutChart from "@/widgets/posthog/eventDetail/EventRelatedDonutChart";
import { cn } from "@/shared/lib/utils";

type BadgeVariant = ClassificationBadgeProps["variant"];

type ErrorCategory = "server" | "client" | "other";
type EnvFilterValue = "production" | "development";

const CATEGORY_OPTIONS: { value: ErrorCategory; label: string }[] = [
  { value: "server", label: "Server Error (5xx)" },
  { value: "client", label: "Client Error (4xx)" },
  { value: "other", label: "Other" },
];

const ENV_OPTIONS: { value: EnvFilterValue; label: string }[] = [
  { value: "development", label: "Development" },
  { value: "production", label: "Production" },
];

/**
 * 이슈의 httpStatusCode 필드로 분류.
 * httpStatusCode가 없으면 title에서 HTTP 상태 코드 패턴을 fallback으로 추출.
 */
const getHttpStatusFromIssue = (issue: SentryIssue): number | null => {
  if (issue.httpStatusCode) {
    return Number(issue.httpStatusCode);
  }
  const match = issue.title.match(/HTTP (\d{3})/);
  return match ? Number(match[1]) : null;
};

const filterByCategory = (
  issues: SentryIssue[],
  category: ErrorCategory,
): SentryIssue[] => {
  return issues.filter((issue) => {
    const status = getHttpStatusFromIssue(issue);
    switch (category) {
      case "server":
        return status !== null && status >= 500 && status < 600;
      case "client":
        return status !== null && status >= 400 && status < 500;
      case "other":
        return status === null;
    }
  });
};

const BADGE_CONFIG: {
  key: BadgeVariant;
  label: string;
  colorClass: string;
}[] = [
  { key: "new", label: "신규", colorClass: "bg-primary" },
  { key: "dev", label: "재발", colorClass: "bg-warning" },
  { key: "critical", label: "급증", colorClass: "bg-error" },
  { key: "longterm", label: "장기미해결", colorClass: "bg-text-secondary" },
];

const ErrorAnalysisDashboard = (): ReactElement => {
  const [category, setCategory] = useState<ErrorCategory>("server");
  const [envFilter, setEnvFilter] = useState<EnvFilterValue>("development");

  const { data, isLoading, error } = useErrorList({
    environment: envFilter,
  });

  useApiErrorToast(!!error, "에러 통계를 불러오는 데 실패했습니다");

  const allIssues = data?.issues ?? [];
  const issues = useMemo(
    () => filterByCategory(allIssues, category),
    [allIssues, category],
  );

  // 뱃지 분류별 통계
  const badgeStats = useMemo(() => {
    const counts: Record<BadgeVariant, number> = {
      new: 0,
      dev: 0,
      critical: 0,
      longterm: 0,
      none: 0,
    };
    for (const issue of issues) {
      const classifications = getIssueClassifications(issue);
      for (const c of classifications) {
        counts[c]++;
      }
    }
    return BADGE_CONFIG.map((b) => ({
      ...b,
      count: counts[b.key],
      percentage:
        issues.length > 0
          ? ((counts[b.key] / issues.length) * 100).toFixed(1)
          : "0",
    }));
  }, [issues]);

  // 에러 타입별 통계 (Other 카테고리에서 사용)
  const typeStats = useMemo(() => {
    const typeMap = new Map<string, number>();
    for (const issue of issues) {
      const type = issue.metadata?.type ?? "Unknown";
      typeMap.set(type, (typeMap.get(type) ?? 0) + 1);
    }
    return [...typeMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => ({
        type,
        count,
        percentage:
          issues.length > 0 ? ((count / issues.length) * 100).toFixed(1) : "0",
      }));
  }, [issues]);

  // 상태 코드별 통계 (Server/Client 카테고리에서 사용)
  const statusCodeStats = useMemo(() => {
    const codeMap = new Map<string, number>();
    for (const issue of issues) {
      const status = getHttpStatusFromIssue(issue);
      const code = status ? String(status) : "Unknown";
      codeMap.set(code, (codeMap.get(code) ?? 0) + Number(issue.count));
    }
    const total = [...codeMap.values()].reduce((sum, c) => sum + c, 0);
    return [...codeMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([code, count]) => ({
        code,
        count,
        percentage: total > 0 ? ((count / total) * 100).toFixed(1) : "0",
      }));
  }, [issues]);

  // 에러 핫스팟 (culprit 기준)
  const hotspotStats = useMemo(() => {
    const culpritMap = new Map<string, { count: number; errorCount: number }>();
    for (const issue of issues) {
      const culprit = issue.culprit || "Unknown";
      const existing = culpritMap.get(culprit) ?? { count: 0, errorCount: 0 };
      existing.count++;
      existing.errorCount += Number(issue.count);
      culpritMap.set(culprit, existing);
    }
    return [...culpritMap.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .map(([culprit, stats]) => ({
        culprit,
        issueCount: stats.count,
        errorCount: stats.errorCount,
      }));
  }, [issues]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-8 w-44" />
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center gap-3">
          <h1 className="text-h1 font-bold text-text-primary">
            에러 통계 분석
          </h1>
        </div>
        <EmptyState
          message="에러 통계를 불러오는 데 실패했습니다"
          iconColor="var(--color-error)"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* 헤더: 타이틀 + 드롭다운 */}
      <div className="flex items-center gap-3">
        <h1 className="text-h1 font-bold text-text-primary">에러 통계 분석</h1>
        <Dropdown
          value={category}
          onChange={setCategory}
          options={CATEGORY_OPTIONS}
          ariaLabel="에러 분류 선택"
        />
        <Dropdown
          value={envFilter}
          onChange={setEnvFilter}
          options={ENV_OPTIONS}
          ariaLabel="환경 필터"
        />
      </div>

      {issues.length === 0 ? (
        <EmptyState message="해당 분류의 에러 데이터가 없습니다" />
      ) : (
        <>
          {/* 뱃지 분류별 통계 */}
          <section className="flex flex-col gap-3">
            <h2 className="text-body1 font-medium text-text-primary">
              분류별 통계
            </h2>
            <div className="grid grid-cols-4 gap-3">
              {badgeStats.map((stat) => (
                <div
                  key={stat.key}
                  className="flex flex-col gap-2 p-4 rounded-xl border border-border-subtle bg-bg-card"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "w-2.5 h-2.5 rounded-full",
                        stat.colorClass,
                      )}
                    />
                    <span className="text-body2 text-text-secondary">
                      {stat.label}
                    </span>
                  </div>
                  <span className="text-h1 font-bold text-text-primary">
                    {stat.count}건
                  </span>
                  <span className="text-caption text-text-tertiary">
                    {stat.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* 에러 타입별 / 상태 코드별 통계 */}
          <section className="flex flex-col gap-3">
            <h2 className="text-body1 font-medium text-text-primary">
              {category === "other" ? "에러 타입별 통계" : "상태 코드별 통계"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl border border-border-subtle bg-bg-card">
                <span className="text-caption text-text-tertiary">
                  {category === "other"
                    ? "타입 비중 분포"
                    : "상태 코드 비중 분포"}
                </span>
                {category === "other" ? (
                  typeStats.length === 0 ? (
                    <EmptyState message="타입 정보가 없습니다" />
                  ) : (
                    <EventRelatedDonutChart
                      data={typeStats.map((stat) => ({
                        value: stat.type,
                        count: stat.count,
                      }))}
                      colors={CHART_COLOR_PALETTE}
                    />
                  )
                ) : statusCodeStats.length === 0 ? (
                  <EmptyState message="상태 코드 정보가 없습니다" />
                ) : (
                  <EventRelatedDonutChart
                    data={statusCodeStats.map((stat) => ({
                      value: stat.code,
                      count: stat.count,
                    }))}
                    colors={CHART_COLOR_PALETTE}
                  />
                )}
              </div>
              <div className="p-4 rounded-xl border border-border-subtle bg-bg-card">
                <span className="text-caption text-text-tertiary">
                  {category === "other"
                    ? "타입별 발생 횟수"
                    : "상태 코드별 발생 횟수"}
                </span>
                {category === "other" ? (
                  typeStats.length === 0 ? (
                    <EmptyState message="타입 정보가 없습니다" />
                  ) : (
                    <div className="flex flex-col gap-3 mt-3">
                      {typeStats.map((stat, i) => (
                        <div key={stat.type} className="flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <span className="text-body2 font-mono text-text-primary">
                              {stat.type}
                            </span>
                            <span className="text-caption text-text-tertiary">
                              {stat.count}건 ({stat.percentage}%)
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-bg-hover">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${stat.percentage}%`,
                                backgroundColor:
                                  CHART_COLOR_PALETTE[
                                    i % CHART_COLOR_PALETTE.length
                                  ],
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : statusCodeStats.length === 0 ? (
                  <EmptyState message="상태 코드 정보가 없습니다" />
                ) : (
                  <div className="flex flex-col gap-3 mt-3">
                    {statusCodeStats.map((stat, i) => (
                      <div key={stat.code} className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="text-body2 font-mono text-text-primary">
                            {stat.code}
                          </span>
                          <span className="text-caption text-text-tertiary">
                            {stat.count}건 ({stat.percentage}%)
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-bg-hover">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${stat.percentage}%`,
                              backgroundColor:
                                CHART_COLOR_PALETTE[
                                  i % CHART_COLOR_PALETTE.length
                                ],
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* 에러 발생 위치 통계 */}
          <section className="flex flex-col gap-3">
            <h2 className="text-body1 font-medium text-text-primary">
              에러 발생 위치 Top 5
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl border border-border-subtle bg-bg-card">
                <span className="text-caption text-text-tertiary">
                  이슈 비중
                </span>
                {hotspotStats.length === 0 ? (
                  <EmptyState message="데이터가 없습니다" />
                ) : (
                  <EventRelatedDonutChart
                    data={hotspotStats.slice(0, 5).map((stat) => ({
                      value: stat.culprit,
                      count: stat.issueCount,
                    }))}
                    colors={CHART_COLOR_PALETTE}
                    className="h-64"
                  />
                )}
              </div>
              <div className="p-4 rounded-xl border border-border-subtle bg-bg-card flex flex-col gap-3">
                <span className="text-caption text-text-tertiary">
                  위치별 상세
                </span>
                {hotspotStats.length === 0 ? (
                  <EmptyState message="데이터가 없습니다" />
                ) : (
                  <div className="flex flex-col gap-3">
                    {hotspotStats.slice(0, 5).map((stat, i) => (
                      <div
                        key={stat.culprit}
                        className="flex items-center justify-between py-2 border-b border-border-subtle last:border-b-0"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-caption text-text-tertiary w-5 shrink-0">
                            {i + 1}
                          </span>
                          <span className="text-body2 font-mono text-text-primary truncate">
                            {stat.culprit}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <span className="text-caption text-text-secondary">
                            {stat.issueCount}개 이슈
                          </span>
                          <span className="text-caption text-text-tertiary">
                            {stat.errorCount.toLocaleString()}회
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default ErrorAnalysisDashboard;
