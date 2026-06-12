import { type UseQueryResult, useQuery } from "@tanstack/react-query"
import type {
	EventPagesResponse,
	Period,
} from "@/entities/event/model/eventStats"
import { apiClient } from "@/shared/api/client"

const getEventPages = async (
	eventName: string,
	period: Period,
	signal?: AbortSignal,
): Promise<EventPagesResponse> => {
	const response = await apiClient(
		`/api/posthog/events/${encodeURIComponent(eventName)}/pages?period=${period}`,
		{ signal },
	)
	if (!response.ok) {
		throw new Error("페이지별 데이터를 불러오는 데 실패했습니다")
	}
	return response.json()
}

const useEventPages = (
	eventName: string,
	period: Period,
): UseQueryResult<EventPagesResponse, Error> => {
	return useQuery({
		// period를 queryKey에 포함 → 기간 선택기 변경 시 자동 재요청
		queryKey: ["events", "detail", eventName, "pages", period],
		queryFn: ({ signal }) => getEventPages(eventName, period, signal),
		enabled: !!eventName,
	})
}

export { getEventPages, useEventPages }
