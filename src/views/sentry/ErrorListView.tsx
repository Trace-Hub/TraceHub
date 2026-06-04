"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ReactElement } from "react";
import { useErrorList } from "@/entities/error/api/getErrorList";
import type {
  ErrorStatus,
  SentryIssue,
} from "@/entities/error/model/errorStats";
import FilterBar from "@/shared/ui/FilterBar";
import StatusBadge from "@/shared/ui/StatusBadge";
import InsightLabel from "@/shared/ui/InsightLabel";
import DropIcon from "@/shared/ui/icons/DropIcon";
import LiftIcon from "@/shared/ui/icons/LiftIcon";
import type { StatusFilterValue } from "@/shared/ui/StatusFilter";
import type { EnvFilterValue } from "@/shared/ui/EnvFilter";
import dayjs from "@/shared/lib/dayjs";
import { cn } from "@/shared/lib/utils";

const STATUS_MAP: Record<StatusFilterValue, ErrorStatus | undefined> = {
  all: undefined,
  unresolved: "unresolved",
  ignored: "ignored",
  resolved: "resolved",
};

interface ErrorCardProps {
  issue: SentryIssue;
}

const ErrorCard = ({ issue }: ErrorCardProps): ReactElement => {
  const router = useRouter();
  const [isInsightOpen, setIsInsightOpen] = useState(true);

  const handleCardClick = (): void => {
    router.push(`/dashboard/errors/${issue.id}`);
  };

  return (
    <div className="rounded-xl border border-border-base bg-bg-base overflow-hidden">
      {/* 카드 본문 - 클릭 시 상세 페이지 이동 */}
      <button
        type="button"
        onClick={handleCardClick}
        className="w-full p-4 flex flex-col gap-2 text-left hover:bg-bg-hover transition-colors"
      >
        <div className="flex items-center gap-2">
          <StatusBadge variant={issue.status} />
          <span className="text-body2 font-medium text-text-primary font-mono">
            {issue.title}
          </span>
        </div>
        <p className="text-caption text-text-secondary">
          발생:{" "}
          <span className="font-medium text-text-primary">
            {Number(issue.count).toLocaleString()}회
          </span>
          {" · "}
          영향 사용자:{" "}
          <span className="font-medium text-text-primary">
            {issue.userCount.toLocaleString()}명
          </span>
          {" · "}
          최초: {dayjs(issue.firstSeen).format("MM/DD")}
          {" · "}
          마지막: {dayjs(issue.lastSeen).format("MM/DD HH:mm")}
        </p>
        <p className="text-caption text-text-tertiary">{issue.culprit}</p>
      </button>

      {/* 인사이트 영역 */}
      <div
        className={cn(
          "px-4 flex flex-col gap-2",
          isInsightOpen ? "pb-3" : "pb-0",
        )}
      >
        {isInsightOpen && (
          <>
            <InsightLabel
              variant="fact"
              text={`${issue.title} 에러가 ${Number(issue.count).toLocaleString()}회 발생했습니다. 영향 사용자는 ${issue.userCount.toLocaleString()}명입니다.`}
            />
            <InsightLabel
              variant="comparison"
              text="최근 발생 추이를 확인하고 이전 배포 시점과 비교해보세요."
            />
            <InsightLabel
              variant="action"
              text={`${issue.culprit} 파일을 확인하고 관련 코드를 점검하세요.`}
            />
          </>
        )}
      </div>

      {/* 토글 푸터 */}
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
          className="text-caption text-text-tertiary hover:text-text-secondary"
        >
          Sentry에서 보기↗
        </a>
      </div>
    </div>
  );
};

const ErrorListView = (): ReactElement => {
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("all");
  const [envFilter, setEnvFilter] = useState<EnvFilterValue>("production");

  const status = STATUS_MAP[statusFilter];
  const { data, isLoading, error } = useErrorList({
    status,
    environment: envFilter,
  });

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-h1 font-bold text-text-primary">에러 목록</h1>
        <p className="text-body2 text-text-secondary mt-1">
          Sentry에서 수집된 미해결 에러입니다.
        </p>
      </div>

      {/* 필터바 */}
      <FilterBar
        statusValue={statusFilter}
        envValue={envFilter}
        onStatusChange={setStatusFilter}
        onEnvChange={setEnvFilter}
        className="rounded-xl"
      />

      {/* 목록 */}
      {isLoading && (
        <p className="text-body2 text-text-tertiary py-8 text-center">
          로딩 중...
        </p>
      )}
      {error && (
        <p className="text-body2 text-error py-8 text-center">
          이슈 목록을 불러오는 데 실패했습니다
        </p>
      )}
      {data && (
        <div className="flex flex-col gap-3">
          {data.issues.map((issue) => (
            <ErrorCard key={issue.id} issue={issue} />
          ))}
          {data.issues.length === 0 && (
            <p className="text-body2 text-text-tertiary py-8 text-center">
              이슈가 없습니다
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ErrorListView;
