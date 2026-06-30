import { type UseQueryResult, useQuery } from "@tanstack/react-query"
import type { RetentionResponse } from "@/entities/event/model/retention"
import { apiClient } from "@/shared/api/client"

const getRetention = async (signal?: AbortSignal): Promise<RetentionResponse> => {
	const response = await apiClient("/api/posthog/retention", { signal })
	if (!response.ok) {
		throw new Error("리텐션 데이터를 불러오는 데 실패했습니다")
	}
	return response.json()
}

const useRetention = (): UseQueryResult<RetentionResponse, Error> => {
	return useQuery({
		queryKey: ["events", "retention"],
		queryFn: ({ signal }) => getRetention(signal),
		refetchOnWindowFocus: false,
	})
}

export { getRetention, useRetention }
