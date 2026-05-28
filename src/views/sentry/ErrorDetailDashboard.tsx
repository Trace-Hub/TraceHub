"use client";

import { useState } from "react";
import type { ReactElement } from "react";
import type {
  SentryIssue,
  ErrorTagType,
  ErrorStatsPeriod,
} from "@/entities/error/model/errorStats";
import { useErrorStats } from "@/entities/error/api/getErrorStats";
import { useErrorTags } from "@/entities/error/api/getErrorTags";
import ErrorTimeChart from "@/views/sentry/ErrorTimeChart";
import ErrorTagChart from "@/views/sentry/ErrorTagChart";
import PeriodSelector from "@/shared/ui/PeriodSelector";
import InsightLabel from "@/shared/ui/InsightLabel";
import type { Period } from "@/shared/ui/PeriodTab";
import { cn } from "@/shared/lib/utils";

interface ErrorDetailDashboardProps {
  issue: SentryIssue;
  className?: string;
}

const TAG_TABS: { label: string; value: ErrorTagType }[] = [
  { label: "브라우저", value: "browser.name" },
  { label: "OS", value: "os.name" },
  { label: "환경", value: "environment" },
];

const TAB_TO_PERIOD: Record<Period, ErrorStatsPeriod> = {
  오늘: "24h",
  "7일": "7d",
  "30일": "30d",
};

const ErrorDetailDashboard = ({
  issue,
  className,
}: ErrorDetailDashboardProps): ReactElement => {
  const [activePeriod, setActivePeriod] = useState<Period>("오늘");
  const [activeTag, setActiveTag] = useState<ErrorTagType>("browser.name");

  const period = TAB_TO_PERIOD[activePeriod];
  const { data: statsData, isLoading: statsLoading } = useErrorStats(
    issue.id,
    period,
  );
  const {
    data: tagData,
    isLoading: tagLoading,
    isError: tagError,
  } = useErrorTags(issue.id, activeTag);

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* 인사이트 */}
      <section className="flex flex-col gap-2 p-4 rounded-xl border border-border-base bg-bg-base">
        <InsightLabel
          variant="fact"
          text={`${issue.title} 에러가 ${issue.count}회 발생했습니다. 영향 사용자는 ${issue.userCount}명입니다.`}
        />
        <InsightLabel
          variant="comparison"
          // TODO: LLM 연동 후 이전 기간 대비 증감 문구로 교체
          text="최근 발생 추이를 확인하고 이전 배포 시점과 비교해보세요."
        />
        <InsightLabel
          variant="action"
          // TODO: LLM 연동 후 에러 원인 기반 행동 가이드로 교체
          text={`${issue.culprit} 파일을 확인하고 관련 코드를 점검하세요.`}
        />
      </section>

      {/* 시간대별 발생 현황 */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-body2 font-medium text-text-primary">
            시간대별 발생 현황
          </h3>
          <PeriodSelector value={activePeriod} onChange={setActivePeriod} />
        </div>
        <div className="p-4 rounded-xl border border-border-base bg-bg-base">
          {statsLoading && (
            <p className="text-caption text-text-tertiary py-8 text-center">
              로딩 중...
            </p>
          )}
          {statsData && (
            <ErrorTimeChart stats={statsData.stats} period={period} />
          )}
        </div>
      </section>

      {/* 환경별 분포 */}
      <section className="flex flex-col gap-3">
        <h3 className="text-body2 font-medium text-text-primary">
          환경별 분포
        </h3>
        <div className="p-4 rounded-xl border border-border-base bg-bg-base">
          <div className="flex gap-1 mb-4">
            {TAG_TABS.map((tab) => (
              <button
                key={tab.value}
                role="tab"
                type="button"
                aria-selected={activeTag === tab.value}
                onClick={() => setActiveTag(tab.value)}
                className={cn(
                  "px-3 py-1 rounded-md text-caption font-medium transition-colors",
                  activeTag === tab.value
                    ? "bg-primary text-white"
                    : "text-text-secondary hover:text-text-primary",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {tagLoading && (
            <p className="text-caption text-text-tertiary py-8 text-center">
              로딩 중...
            </p>
          )}
          {tagError && (
            <p className="text-body2 text-text-tertiary py-8 text-center">
              데이터가 없습니다
            </p>
          )}
          {!tagLoading && !tagError && tagData && tagData.values.length > 0 && (
            <ErrorTagChart values={tagData.values} />
          )}
          {!tagLoading &&
            !tagError &&
            tagData &&
            tagData.values.length === 0 && (
              <p className="text-body2 text-text-tertiary py-8 text-center">
                데이터가 없습니다
              </p>
            )}

          <div className="flex justify-end mt-2">
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
      </section>
    </div>
  );
};

export default ErrorDetailDashboard;
