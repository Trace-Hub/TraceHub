import {
  useInfiniteQuery,
  type InfiniteData,
  type UseInfiniteQueryResult,
} from "@tanstack/react-query";
import type {
  ErrorListResponse,
  ErrorQueryParams,
} from "@/entities/error/model/errorStats";
import { apiClient } from "@/shared/api/client";

const getErrorList = async (
  params: ErrorQueryParams = {},
  cursor?: string,
): Promise<ErrorListResponse> => {
  const searchParams = new URLSearchParams();

  if (params.status) searchParams.set("status", params.status);
  if (params.environment) searchParams.set("environment", params.environment);
  if (params.query) searchParams.set("query", params.query);
  if (cursor) searchParams.set("cursor", cursor);

  const queryString = searchParams.toString();
  const path = `/api/sentry/issues${queryString ? `?${queryString}` : ""}`;

  const response = await apiClient(path);
  if (!response.ok) {
    throw new Error("에러 목록을 불러오는 데 실패했습니다");
  }
  return response.json();
};

type ErrorListInfiniteData = InfiniteData<
  ErrorListResponse,
  string | undefined
>;

const useErrorList = (
  params: ErrorQueryParams = {},
): UseInfiniteQueryResult<ErrorListInfiniteData, Error> => {
  return useInfiniteQuery<
    ErrorListResponse,
    Error,
    ErrorListInfiniteData,
    readonly unknown[],
    string | undefined
  >({
    queryKey: ["sentry", "issues", params],
    queryFn: ({ pageParam }) => getErrorList(params, pageParam),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
};

export { getErrorList, useErrorList };
export type { ErrorListInfiniteData };
