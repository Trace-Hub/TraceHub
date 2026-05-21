import { useQuery, type UseQueryResult } from "@tanstack/react-query"
import type { EventStatsResponse, Period } from "@/entities/event/model/eventStats"
import { apiClient } from "@/shared/api/client"

async function getEventStats(period: Period): Promise<EventStatsResponse> {
	const response = await apiClient(`/api/posthog/events?period=${period}`)
	if (!response.ok) {
		throw new Error("이벤트 데이터를 불러오는 데 실패했습니다")
	}
	return response.json()
}

function useEventStats(period: Period): UseQueryResult<EventStatsResponse, Error> {
	return useQuery({
		queryKey: ["events", "stats", period],
		queryFn: () => getEventStats(period),
	})
}

export { getEventStats, useEventStats }
