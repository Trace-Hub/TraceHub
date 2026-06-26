"use client";

import { useState } from "react";
import type { ReactElement } from "react";
import { useErrorList } from "@/entities/error/api/getErrorList";
import type { ErrorStatus } from "@/entities/error/model/errorStats";
import ErrorCard from "@/shared/ui/ErrorCard";
import EmptyState from "@/shared/ui/EmptyState";
import FilterBar from "@/shared/ui/FilterBar";
import useApiErrorToast from "@/shared/hooks/useApiErrorToast";
import ErrorListSkeleton from "@/views/sentry/ErrorListSkeleton";
import type { StatusFilterValue } from "@/shared/ui/StatusFilter";
import type { EnvFilterValue } from "@/shared/ui/EnvFilter";

const STATUS_MAP: Record<StatusFilterValue, ErrorStatus | undefined> = {
  all: undefined,
  unresolved: "unresolved",
  ignored: "ignored",
  resolved: "resolved",
};

const ErrorListView = (): ReactElement => {
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("all");
  const [envFilter, setEnvFilter] = useState<EnvFilterValue>("development");

  const status = STATUS_MAP[statusFilter];
  const { data, isLoading, error } = useErrorList({
    status,
    environment: envFilter,
  });

  useApiErrorToast(!!error, "이슈 목록을 불러오는 데 실패했습니다");

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
      {isLoading && <ErrorListSkeleton />}
      {!isLoading && error && (
        <EmptyState
          message="이슈 목록을 불러오는 데 실패했습니다"
          iconColor="var(--color-error)"
        />
      )}
      {data && (
        <div className="flex flex-col gap-3">
          {data.issues.map((issue) => (
            <ErrorCard key={issue.id} issue={issue} defaultInsightOpen />
          ))}
          {data.issues.length === 0 && <EmptyState message="이슈가 없습니다" />}
        </div>
      )}
    </div>
  );
};

export default ErrorListView;
