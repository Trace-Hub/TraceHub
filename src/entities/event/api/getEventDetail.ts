import { type UseQueryResult, useQuery } from "@tanstack/react-query"
import type {
	EventDetailResponse,
	Period,
} from "@/entities/event/model/eventStats"
import { apiClient } from "@/shared/api/client"

const getEventDetail = async (
	eventName: string,
	period: Period,
	signal?: AbortSignal,
): Promise<EventDetailResponse> => {
	const response = await apiClient(
		`/api/posthog/events/${encodeURIComponent(eventName)}?period=${period}`,
		{ signal },
	)
	if (!response.ok) {
		throw new Error("이벤트 상세 데이터를 불러오는 데 실패했습니다")
	}
	return response.json()
}

const useEventDetail = (
	eventName: string,
	period: Period,
): UseQueryResult<EventDetailResponse, Error> => {
	return useQuery({
		queryKey: ["events", "detail", eventName, period],
		queryFn: ({ signal }) => getEventDetail(eventName, period, signal),
		enabled: !!eventName,
		refetchInterval: 10_000,
	})
}

export { getEventDetail, useEventDetail }
