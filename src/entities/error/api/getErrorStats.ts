import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type {
  ErrorStatsResponse,
  ErrorStatsPeriod,
} from "@/entities/error/model/errorStats";
import { apiClient } from "@/shared/api/client";

const getErrorStats = async (
  issueId: string,
  period: ErrorStatsPeriod,
): Promise<ErrorStatsResponse> => {
  const response = await apiClient(
    `/api/sentry/issues/${issueId}/stats?period=${period}`,
  );
  if (!response.ok) throw new Error("통계 데이터를 불러오는 데 실패했습니다");
  return response.json();
};

const useErrorStats = (
  issueId: string,
  period: ErrorStatsPeriod,
): UseQueryResult<ErrorStatsResponse, Error> => {
  return useQuery({
    queryKey: ["sentry", "issues", issueId, "stats", period],
    queryFn: () => getErrorStats(issueId, period),
    enabled: !!issueId,
  });
};

export { getErrorStats, useErrorStats };
