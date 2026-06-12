import { type UseQueryResult, useQuery } from "@tanstack/react-query"
import type {
	PageEventDistributionResponse,
	Period,
} from "@/entities/event/model/eventStats"
import { apiClient } from "@/shared/api/client"

const getPageEventDistribution = async (
	pathname: string,
	period: Period,
	signal?: AbortSignal,
): Promise<PageEventDistributionResponse> => {
	const pathnameParam = pathname
		? `pathname=${encodeURIComponent(pathname)}&`
		: ""
	const response = await apiClient(
		`/api/posthog/pages/events?${pathnameParam}period=${period}`,
		{ signal },
	)
	if (!response.ok) {
		throw new Error("페이지 이벤트 분포 데이터를 불러오는 데 실패했습니다")
	}
	return response.json()
}

const usePageEventDistribution = (
	pathname: string,
	period: Period,
): UseQueryResult<PageEventDistributionResponse, Error> => {
	return useQuery({
		queryKey: ["pages", pathname, "events", period],
		queryFn: ({ signal }) => getPageEventDistribution(pathname, period, signal),
	})
}

export { getPageEventDistribution, usePageEventDistribution }
