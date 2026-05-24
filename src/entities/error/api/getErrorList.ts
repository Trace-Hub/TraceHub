import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type {
  ErrorListResponse,
  ErrorQueryParams,
} from "@/entities/error/model/errorStats";
import { apiClient } from "@/shared/api/client";

const getErrorList = async (
  params: ErrorQueryParams = {},
): Promise<ErrorListResponse> => {
  const searchParams = new URLSearchParams();

  if (params.status) searchParams.set("status", params.status);
  if (params.environment) searchParams.set("environment", params.environment);
  if (params.query) searchParams.set("query", params.query);

  const queryString = searchParams.toString();
  const path = `/api/sentry/issues${queryString ? `?${queryString}` : ""}`;

  const response = await apiClient(path);
  if (!response.ok) {
    throw new Error("에러 목록을 불러오는 데 실패했습니다");
  }
  return response.json();
};

const useErrorList = (
  params: ErrorQueryParams = {},
): UseQueryResult<ErrorListResponse, Error> => {
  return useQuery({
    queryKey: ["sentry", "issues", params],
    queryFn: () => getErrorList(params),
  });
};

export { getErrorList, useErrorList };
