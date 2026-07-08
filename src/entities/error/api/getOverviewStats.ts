import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type {
  ErrorStatsPeriod,
  ErrorStatPoint,
} from "@/entities/error/model/errorStats";
import { apiClient } from "@/shared/api/client";

interface OverviewStatsResponse {
  period: string;
  stats: ErrorStatPoint[];
}

const getOverviewStats = async (
  period: ErrorStatsPeriod,
): Promise<OverviewStatsResponse> => {
  const response = await apiClient(`/api/sentry/stats?period=${period}`);
  if (!response.ok) throw new Error("에러 통계를 불러오는 데 실패했습니다");
  return response.json();
};

const useOverviewStats = (
  period: ErrorStatsPeriod,
  enabled = true,
): UseQueryResult<OverviewStatsResponse, Error> => {
  return useQuery({
    queryKey: ["sentry", "overview-stats", period],
    queryFn: () => getOverviewStats(period),
    enabled,
  });
};

export { getOverviewStats, useOverviewStats };
