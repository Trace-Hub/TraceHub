import { type UseQueryResult, useQuery } from "@tanstack/react-query"
import type {
	EventPropertyResponse,
	EventPropertyType,
} from "@/entities/event/model/eventStats"
import { apiClient } from "@/shared/api/client"

const getEventProperty = async (
	eventName: string,
	propertyType: EventPropertyType,
	signal?: AbortSignal,
): Promise<EventPropertyResponse> => {
	const response = await apiClient(
		`/api/posthog/events/${encodeURIComponent(eventName)}/property/${propertyType}`,
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
): UseQueryResult<EventPropertyResponse, Error> => {
	return useQuery({
		// propertyType을 key에 포함 → 탭별로 독립 캐싱, 한 번 조회한 탭은 재요청 없이 즉시 표시
		queryKey: ["events", "detail", eventName, "property", propertyType],
		queryFn: ({ signal }) => getEventProperty(eventName, propertyType, signal),
		enabled: !!eventName,
	})
}

export { getEventProperty, useEventProperty }
