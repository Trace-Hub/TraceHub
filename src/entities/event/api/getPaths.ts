import { type UseQueryResult, useQuery } from "@tanstack/react-query"
import type { Period } from "@/entities/event/model/eventStats"
import type { PathFlowsResponse, PathStepCount } from "@/entities/event/model/paths"
import { apiClient } from "@/shared/api/client"

const getPaths = async (
	start: string,
	period: Period,
	stepCount: PathStepCount,
	signal?: AbortSignal,
): Promise<PathFlowsResponse> => {
	const response = await apiClient(
		`/api/posthog/paths?start=${encodeURIComponent(start)}&period=${period}&steps=${stepCount}`,
		{ signal },
	)
	if (!response.ok) {
		throw new Error("경로 흐름 데이터를 불러오는 데 실패했습니다")
	}
	return response.json()
}

const usePaths = (
	start: string,
	period: Period,
	stepCount: PathStepCount,
): UseQueryResult<PathFlowsResponse, Error> => {
	return useQuery({
		queryKey: ["events", "paths", start, period, stepCount],
		queryFn: ({ signal }) => getPaths(start, period, stepCount, signal),
		refetchOnWindowFocus: false,
		staleTime: 5 * 60 * 1000,
	})
}

export { getPaths, usePaths }
