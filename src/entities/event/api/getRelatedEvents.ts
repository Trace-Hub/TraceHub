import { type UseQueryResult, useQuery } from "@tanstack/react-query"
import type {
	Period,
	RelatedEventsResponse,
} from "@/entities/event/model/eventStats"
import { apiClient } from "@/shared/api/client"

const getRelatedEvents = async (
	eventName: string,
	period: Period,
	signal?: AbortSignal,
): Promise<RelatedEventsResponse> => {
	const response = await apiClient(
		`/api/posthog/events/${encodeURIComponent(eventName)}/related?period=${period}`,
		{ signal },
	)
	if (!response.ok) {
		throw new Error("연관 이벤트 데이터를 불러오는 데 실패했습니다")
	}
	return response.json()
}

const useRelatedEvents = (
	eventName: string,
	period: Period,
): UseQueryResult<RelatedEventsResponse, Error> => {
	return useQuery({
		// period를 queryKey에 포함 → 기간 선택기 변경 시 자동 재요청
		queryKey: ["events", "detail", eventName, "related", period],
		queryFn: ({ signal }) => getRelatedEvents(eventName, period, signal),
		enabled: !!eventName,
	})
}

export { getRelatedEvents, useRelatedEvents }
