import { type UseQueryResult, useQuery } from "@tanstack/react-query"
import type {
	EventPropertyResponse,
	EventPropertyType,
	Period,
} from "@/entities/event/model/eventStats"
import { apiClient } from "@/shared/api/client"

const getEventProperty = async (
	eventName: string,
	propertyType: EventPropertyType,
	period: Period,
	signal?: AbortSignal,
): Promise<EventPropertyResponse> => {
	const response = await apiClient(
		`/api/posthog/events/${encodeURIComponent(eventName)}/property/${propertyType}?period=${period}`,
		{ signal },
	)
	if (!response.ok) {
		throw new Error("속성 분포 데이터를 불러오는 데 실패했습니다")
	}
	return response.json()
}

const useEventProperty = (
	eventName: string,
	propertyType: EventPropertyType,
	period: Period,
): UseQueryResult<EventPropertyResponse, Error> => {
	return useQuery({
		// propertyType과 period를 key에 포함 → 탭·기간별로 독립 캐싱
		queryKey: ["events", "detail", eventName, "property", propertyType, period],
		queryFn: ({ signal }) => getEventProperty(eventName, propertyType, period, signal),
		enabled: !!eventName,
	})
}

export { getEventProperty, useEventProperty }
