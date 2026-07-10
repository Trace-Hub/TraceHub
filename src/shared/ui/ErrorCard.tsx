"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ReactElement } from "react";
import type { SentryIssue } from "@/entities/error/model/errorStats";
import { getIssueClassifications } from "@/entities/error/model/errorStatsUtils";
import ClassificationBadge from "@/shared/ui/ClassificationBadge";
import StatusBadge from "@/shared/ui/StatusBadge";
import InsightLabel from "@/shared/ui/InsightLabel";
import DropIcon from "@/shared/ui/icons/DropIcon";
import LiftIcon from "@/shared/ui/icons/LiftIcon";
import LinkIcon from "@/shared/ui/icons/LinkIcon";
import dayjs from "@/shared/lib/dayjs";
import { cn } from "@/shared/lib/utils";

interface ErrorCardProps {
  issue: SentryIssue;
  /** 인사이트 영역 기본 열림 여부 (기본값: false) */
  defaultInsightOpen?: boolean;
  /** 카드 본문 영역 최소 높이 클래스 (예: "min-h-30") */
  minHeightClass?: string;
  /** 발생 환경 표시 (예: "production", "development") */
  environment?: string;
  className?: string;
}

const ErrorCard = ({
  issue,
  defaultInsightOpen = false,
  minHeightClass,
  environment,
  className,
}: ErrorCardProps): ReactElement => {
  const [isInsightOpen, setIsInsightOpen] = useState(defaultInsightOpen);
  const router = useRouter();

  const handleCardClick = (): void => {
    router.push(`/dashboard/errors/${issue.id}`);
  };

  const classifications = getIssueClassifications(issue);

  return (
    <div
      className={cn(
        "rounded-xl border border-border-base bg-bg-base overflow-hidden flex flex-col",
        className,
      )}
    >
      <button
        type="button"
        onClick={handleCardClick}
        className={cn(
          "w-full p-4 flex flex-col gap-2 text-left hover:bg-bg-hover transition-colors flex-1",
          minHeightClass,
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center gap-1 shrink-0">
              {classifications.map((variant) => (
                <ClassificationBadge key={variant} variant={variant} />
              ))}
            </div>
            <p className="text-body2 font-medium text-text-primary font-mono truncate">
              {issue.title}
            </p>
          </div>
          <StatusBadge variant={issue.status} className="shrink-0" />
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
          {(environment || issue.environment) && (
            <>
              {" · "}환경:{" "}
              <span className="font-medium">
                {environment || issue.environment}
              </span>
            </>
          )}
        </p>
        <p className="text-caption text-text-tertiary">{issue.culprit}</p>
      </button>

      {isInsightOpen && (
        <div className="px-4 pb-3 flex flex-col gap-2">
          <InsightLabel
            variant="fact"
            text={`에러가 ${Number(issue.count).toLocaleString()}회 발생했습니다. 영향 사용자는 ${issue.userCount.toLocaleString()}명입니다.`}
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
          onClick={() => setIsInsightOpen((prev) => !prev)}
          className="flex items-center gap-1 text-caption text-text-tertiary hover:text-text-secondary transition-colors"
        >
          {isInsightOpen ? (
            <LiftIcon color="var(--color-text-tertiary)" />
          ) : (
            <DropIcon color="var(--color-text-tertiary)" />
          )}
          <span>{isInsightOpen ? "해석 숨기기" : "해석 보기"}</span>
        </button>
        <a
          href={issue.permalink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 text-caption text-text-tertiary hover:text-text-secondary"
        >
          Sentry에서 보기
          <LinkIcon color="currentColor" />
        </a>
      </div>
    </div>
  );
};

export default ErrorCard;
