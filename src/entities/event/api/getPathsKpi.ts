import { type UseQueryResult, useQuery } from "@tanstack/react-query"
import type { Period } from "@/entities/event/model/eventStats"
import type { PathsKpiResponse } from "@/entities/event/model/paths"
import { apiClient } from "@/shared/api/client"

const getPathsKpi = async (period: Period, signal?: AbortSignal): Promise<PathsKpiResponse> => {
	const response = await apiClient(`/api/posthog/paths/kpi?period=${period}`, { signal })
	if (!response.ok) {
		throw new Error("경로 KPI 데이터를 불러오는 데 실패했습니다")
	}
	return response.json()
}

const usePathsKpi = (period: Period): UseQueryResult<PathsKpiResponse, Error> => {
	return useQuery({
		queryKey: ["events", "paths", "kpi", period],
		queryFn: ({ signal }) => getPathsKpi(period, signal),
		refetchOnWindowFocus: false,
		// SSR prefetchQuery로 채운 데이터를 마운트 시 재요청하지 않도록 5분간 fresh 유지
		staleTime: 5 * 60 * 1000,
	})
}

export { getPathsKpi, usePathsKpi }
