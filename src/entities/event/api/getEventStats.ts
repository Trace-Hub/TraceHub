import { type UseQueryResult, useQuery } from "@tanstack/react-query";
import type {
	EventStatsResponse,
	Period,
} from "@/entities/event/model/eventStats";
import { EVENT_STATS_REFETCH_INTERVAL_MS } from "@/entities/event/model/eventStats";
import { apiClient } from "@/shared/api/client";

const getEventStats = async (
	period: Period,
	path: string,
	signal?: AbortSignal,
): Promise<EventStatsResponse> => {
	const response = await apiClient(
		`/api/posthog/events?period=${period}&path=${encodeURIComponent(path)}`,
		{ signal },
	);
	if (!response.ok) {
		throw new Error("이벤트 데이터를 불러오는 데 실패했습니다");
	}
	return response.json();
};

const useEventStats = (
	period: Period,
	path = "all",
): UseQueryResult<EventStatsResponse, Error> => {
	return useQuery({
		queryKey: ["events", "stats", period, path],
		queryFn: ({ signal }) => getEventStats(period, path, signal),
		staleTime: EVENT_STATS_REFETCH_INTERVAL_MS,
		refetchOnWindowFocus: false,
		refetchInterval: EVENT_STATS_REFETCH_INTERVAL_MS,
	});
};

export { getEventStats, useEventStats };
