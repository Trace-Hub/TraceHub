"use client";

import { useRouter } from "next/navigation";
import type { ReactElement } from "react";
import { useErrorDetail } from "@/entities/error/api/getErrorDetail";
import {
  formatIssueSummary,
  getIssueClassifications,
} from "@/entities/error/model/errorStatsUtils";
import ErrorDetailDashboard from "@/views/sentry/ErrorDetailDashboard";
import ErrorDetailSkeleton from "@/views/sentry/ErrorDetailSkeleton";
import ClassificationBadge from "@/shared/ui/ClassificationBadge";
import EmptyState from "@/shared/ui/EmptyState";
import StatusBadge from "@/shared/ui/StatusBadge";
import useApiErrorToast from "@/shared/hooks/useApiErrorToast";
import dayjs from "@/shared/lib/dayjs";

interface ErrorDetailViewProps {
  issueId: string;
}

const ErrorDetailView = ({ issueId }: ErrorDetailViewProps): ReactElement => {
  const router = useRouter();
  const { data: issue, isLoading, error } = useErrorDetail(issueId);

  useApiErrorToast(!!error, "이슈 데이터를 불러오는 데 실패했습니다");

  const handleBack = (): void => {
    router.push("/dashboard/errors");
  };

  if (isLoading) {
    return <ErrorDetailSkeleton />;
  }

  if (error || !issue) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        <EmptyState
          message="이슈 데이터를 불러오는 데 실패했습니다"
          iconColor="var(--color-error)"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      {/* 뒤로가기 */}
      <button
        type="button"
        onClick={handleBack}
        className="flex items-center gap-1 text-caption text-text-tertiary hover:text-text-secondary w-fit"
      >
        ← 에러 목록으로 돌아가기
      </button>

      {/* 이슈 헤더 카드 */}
      <div className="p-4 rounded-xl border border-border-base bg-bg-base flex flex-col gap-2">
        <div className="flex items-center gap-2">
          {getIssueClassifications(issue).map((variant) => (
            <ClassificationBadge key={variant} variant={variant} />
          ))}
          <StatusBadge variant={issue.status} />
        </div>
        <p className="text-h1 font-bold text-text-primary font-mono leading-snug">
          {issue.title}
        </p>
        <p className="text-caption text-text-tertiary">
          culprit: {issue.culprit}
        </p>
        <p className="text-caption text-text-secondary">
          {formatIssueSummary(issue)}
        </p>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1 p-4 rounded-xl border border-border-subtle bg-bg-card">
          <span className="text-caption text-text-tertiary">총 발생 횟수</span>
          <span className="text-h1 font-bold text-text-primary">
            {Number(issue.count).toLocaleString()}회
          </span>
        </div>
        <div className="flex flex-col gap-1 p-4 rounded-xl border border-border-subtle bg-bg-card">
          <span className="text-caption text-text-tertiary">영향 사용자</span>
          <span className="text-h1 font-bold text-text-primary">
            {issue.userCount.toLocaleString()}명
          </span>
        </div>
        <div className="flex flex-col gap-1 p-4 rounded-xl border border-border-subtle bg-bg-card">
          <span className="text-caption text-text-tertiary">경과 일수</span>
          <span className="text-h1 font-bold text-text-primary">
            {dayjs().diff(dayjs(issue.firstSeen), "day")}일
          </span>
        </div>
      </div>

      {/* 인사이트 + 차트 */}
      <ErrorDetailDashboard issue={issue} />
    </div>
  );
};

export default ErrorDetailView;
