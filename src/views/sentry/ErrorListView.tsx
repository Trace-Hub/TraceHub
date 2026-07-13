"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ReactElement } from "react";
import { useErrorList } from "@/entities/error/api/getErrorList";
import type {
  ErrorStatus,
  SentryIssue,
} from "@/entities/error/model/errorStats";
import { getIssueClassifications } from "@/entities/error/model/errorStatsUtils";
import type { ClassificationBadgeProps } from "@/shared/ui/ClassificationBadge";
import Dropdown from "@/shared/ui/Dropdown";
import type { DropdownOption } from "@/shared/ui/Dropdown";
import ErrorCard from "@/shared/ui/ErrorCard";
import EmptyState from "@/shared/ui/EmptyState";
import useApiErrorToast from "@/shared/hooks/useApiErrorToast";
import { ENV_OPTIONS } from "@/shared/config/dropdownOptions";
import type { EnvFilterValue } from "@/shared/config/dropdownOptions";
import ErrorListSkeleton from "@/views/sentry/ErrorListSkeleton";
import { Spinner } from "@/shared/ui/spinner";

type StatusFilterValue = "all" | "unresolved" | "ignored" | "resolved";
type ClassificationFilter = "all" | ClassificationBadgeProps["variant"];

const STATUS_OPTIONS: DropdownOption<StatusFilterValue>[] = [
  { value: "all", label: "상태 전체" },
  { value: "unresolved", label: "미해결" },
  { value: "ignored", label: "무시됨" },
  { value: "resolved", label: "해결됨" },
];

const CLASSIFICATION_OPTIONS: DropdownOption<ClassificationFilter>[] = [
  { value: "all", label: "분류 전체" },
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

// URL 파라미터 key별 기본값 — 기본값일 때 URL에서 제거
const DEFAULT_PARAM_VALUES: Record<string, string> = {
  status: "all",
  env: "development",
  classification: "all",
  q: "",
};

const ErrorListView = (): ReactElement => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>(
    (searchParams.get("status") as StatusFilterValue) || "all",
  );
  const [envFilter, setEnvFilter] = useState<EnvFilterValue>(
    (searchParams.get("env") as EnvFilterValue) || "development",
  );
  const [classificationFilter, setClassificationFilter] =
    useState<ClassificationFilter>(
      (searchParams.get("classification") as ClassificationFilter) || "all",
    );
  const [searchInput, setSearchInput] = useState(searchParams.get("q") ?? "");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") ?? "");
  const [isComposing, setIsComposing] = useState(false);

  // URL 쿼리 파라미터 동기화 — key별 기본값일 때만 URL에서 제거
  const syncParams = useCallback(
    (params: Record<string, string>) => {
      const current = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(params)) {
        if (value === DEFAULT_PARAM_VALUES[key]) {
          current.delete(key);
        } else {
          current.set(key, value);
        }
      }
      const query = current.toString();
      router.replace(`?${query}`, { scroll: false });
    },
    [router, searchParams],
  );

  const handleStatusChange = (value: StatusFilterValue): void => {
    setStatusFilter(value);
    syncParams({ status: value });
  };

  const handleEnvChange = (value: EnvFilterValue): void => {
    setEnvFilter(value);
    syncParams({ env: value });
  };

  const handleClassificationChange = (value: ClassificationFilter): void => {
    setClassificationFilter(value);
    syncParams({ classification: value });
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isComposing) {
      const trimmed = searchInput.trim();
      setSearchQuery(trimmed);
      syncParams({ q: trimmed });
      if (trimmed === "") setSearchInput("");
    }
  };

  const status = STATUS_MAP[statusFilter];
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useErrorList({
    status,
    environment: envFilter,
  });

  useApiErrorToast(!!error, "이슈 목록을 불러오는 데 실패했습니다");

  // 모든 페이지의 이슈를 평탄화
  const allIssues = data?.pages.flatMap((page) => page.issues) ?? [];

  // 클라이언트 사이드 필터 (분류, 검색어)
  const filteredIssues = allIssues.filter((issue) => {
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
        <h1 className="text-h1 font-bold text-text-primary">Trends</h1>
        <p className="text-body2 text-text-secondary mt-1">
          Sentry에서 수집된 에러를 확인하세요.
        </p>
      </div>

      {/* 필터 드롭다운 + 검색 */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <Dropdown
            value={statusFilter}
            onChange={handleStatusChange}
            options={STATUS_OPTIONS}
            ariaLabel="상태 필터"
          />
          <Dropdown
            value={classificationFilter}
            onChange={handleClassificationChange}
            options={CLASSIFICATION_OPTIONS}
            ariaLabel="분류 필터"
          />
          <Dropdown
            value={envFilter}
            onChange={handleEnvChange}
            options={ENV_OPTIONS}
            ariaLabel="환경 필터"
          />
        </div>
        <div className="relative w-full md:w-64">
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
        <InfiniteErrorList
          key={`${statusFilter}-${envFilter}-${classificationFilter}-${searchQuery}`}
          issues={filteredIssues}
          envFilter={envFilter}
          hasNextPage={!!hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
        />
      )}
    </div>
  );
};

// API 기반 무한스크롤 리스트
const InfiniteErrorList = ({
  issues,
  envFilter,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: {
  issues: SentryIssue[];
  envFilter: EnvFilterValue;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}): ReactElement => {
  const observerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = observerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (issues.length === 0 && !hasNextPage) {
    return <EmptyState message="조건에 맞는 이슈가 없습니다" />;
  }

  return (
    <div className="flex flex-col gap-3">
      {issues.map((issue) => (
        <ErrorCard
          key={issue.id}
          issue={issue}
          defaultInsightOpen
          environment={envFilter}
        />
      ))}
      {/* 센티널: 다음 페이지가 있으면 보여줌 */}
      {hasNextPage && (
        <div
          ref={observerRef}
          className="h-16 flex flex-col items-center justify-center gap-2"
        >
          {isFetchingNextPage && (
            <>
              <Spinner className="size-8 [animation-duration:1.5s]" />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ErrorListView;
