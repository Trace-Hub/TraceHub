import { type UseQueryResult, useQuery } from "@tanstack/react-query";
import { EVENT_STATS_REFETCH_INTERVAL_MS } from "@/entities/event/model/eventStats";
import type {
	FunnelPeriod,
	FunnelResponse,
} from "@/entities/event/model/funnel";
import { apiClient } from "@/shared/api/client";

const getFunnel = async (
	funnelId: string,
	period: FunnelPeriod,
	signal?: AbortSignal,
): Promise<FunnelResponse> => {
	const response = await apiClient(
		`/api/posthog/funnel?period=${period}&funnelId=${funnelId}`,
		{ signal },
	);
	if (!response.ok) {
		throw new Error("퍼널 데이터를 불러오는 데 실패했습니다");
	}
	return response.json();
};

const useFunnel = (
	funnelId: string,
	period: FunnelPeriod,
): UseQueryResult<FunnelResponse, Error> => {
	return useQuery({
		queryKey: ["events", "funnel", funnelId, period],
		queryFn: ({ signal }) => getFunnel(funnelId, period, signal),
		staleTime: EVENT_STATS_REFETCH_INTERVAL_MS,
		refetchOnWindowFocus: false,
	});
};

export { getFunnel, useFunnel };
