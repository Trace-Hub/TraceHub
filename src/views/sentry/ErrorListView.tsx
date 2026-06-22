"use client";

import { useState } from "react";
import type { ReactElement } from "react";
import { useErrorList } from "@/entities/error/api/getErrorList";
import type { ErrorStatus } from "@/entities/error/model/errorStats";
import ErrorCard from "@/shared/ui/ErrorCard";
import FilterBar from "@/shared/ui/FilterBar";
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
            <ErrorCard key={issue.id} issue={issue} defaultInsightOpen />
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
