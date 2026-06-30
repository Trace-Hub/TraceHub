"use client";

import { useState } from "react";
import type { ReactElement } from "react";
import { useErrorList } from "@/entities/error/api/getErrorList";
import type { ErrorStatus } from "@/entities/error/model/errorStats";
import { getIssueClassifications } from "@/entities/error/model/errorStatsUtils";
import type { ClassificationBadgeProps } from "@/shared/ui/ClassificationBadge";
import Dropdown from "@/shared/ui/Dropdown";
import type { DropdownOption } from "@/shared/ui/Dropdown";
import ErrorCard from "@/shared/ui/ErrorCard";
import EmptyState from "@/shared/ui/EmptyState";
import FilterBar from "@/shared/ui/FilterBar";
import useApiErrorToast from "@/shared/hooks/useApiErrorToast";
import ErrorListSkeleton from "@/views/sentry/ErrorListSkeleton";
import type { StatusFilterValue } from "@/shared/ui/StatusFilter";
import type { EnvFilterValue } from "@/shared/ui/EnvFilter";

type ClassificationFilter = "all" | ClassificationBadgeProps["variant"];

const CLASSIFICATION_OPTIONS: DropdownOption<ClassificationFilter>[] = [
  { value: "all", label: "전체" },
  { value: "new", label: "신규" },
  { value: "dev", label: "재발" },
  { value: "critical", label: "급증" },
  { value: "longterm", label: "장기미해결" },
];

const STATUS_MAP: Record<StatusFilterValue, ErrorStatus | undefined> = {
  all: undefined,
  unresolved: "unresolved",
  ignored: "ignored",
  resolved: "resolved",
};

const ErrorListView = (): ReactElement => {
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("all");
  const [envFilter, setEnvFilter] = useState<EnvFilterValue>("development");
  const [classificationFilter, setClassificationFilter] =
    useState<ClassificationFilter>("all");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isComposing, setIsComposing] = useState(false);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isComposing) {
      const trimmed = searchInput.trim();
      setSearchQuery(trimmed);
      if (trimmed === "") setSearchInput("");
    }
  };

  const status = STATUS_MAP[statusFilter];
  const { data, isLoading, error } = useErrorList({
    status,
    environment: envFilter,
  });

  useApiErrorToast(!!error, "이슈 목록을 불러오는 데 실패했습니다");

  const filteredIssues = (data?.issues ?? []).filter((issue) => {
    if (classificationFilter !== "all") {
      const classifications = getIssueClassifications(issue);
      if (!classifications.includes(classificationFilter)) return false;
    }
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchTitle = issue.title.toLowerCase().includes(q);
      const matchCulprit = issue.culprit.toLowerCase().includes(q);
      if (!matchTitle && !matchCulprit) return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-3 p-6">
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

      {/* 분류 필터 + 검색 */}
      <div className="flex items-center justify-between">
        <Dropdown
          value={classificationFilter}
          onChange={setClassificationFilter}
          options={CLASSIFICATION_OPTIONS}
          ariaLabel="분류 필터"
        />
        <div className="relative w-64">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="6"
              cy="6"
              r="4.5"
              stroke="var(--color-text-tertiary)"
              strokeWidth="1.5"
            />
            <path
              d="M10 10l2.5 2.5"
              stroke="var(--color-text-tertiary)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Enter로 에러 검색"
            aria-label="에러 검색"
            className="w-full pl-9 pr-3 py-1 rounded-md border border-border-base bg-bg-card text-body2 text-text-primary placeholder:text-text-tertiary outline-none focus:border-border-focus transition-colors"
          />
        </div>
      </div>

      {/* 목록 */}
      {isLoading && <ErrorListSkeleton />}
      {!isLoading && error && (
        <EmptyState
          message="이슈 목록을 불러오는 데 실패했습니다"
          iconColor="var(--color-error)"
        />
      )}
      {!isLoading && !error && data && (
        <div className="flex flex-col gap-3">
          {filteredIssues.map((issue) => (
            <ErrorCard key={issue.id} issue={issue} defaultInsightOpen />
          ))}
          {filteredIssues.length === 0 && (
            <EmptyState message="조건에 맞는 이슈가 없습니다" />
          )}
        </div>
      )}
    </div>
  );
};

export default ErrorListView;
