import { type UseQueryResult, useQuery } from "@tanstack/react-query";
import type { EventKpiResponse } from "@/entities/event/model/eventStats";
import { EVENT_STATS_REFETCH_INTERVAL_MS } from "@/entities/event/model/eventStats";
import { apiClient } from "@/shared/api/client";

const getEventKpi = async (
	path: string,
	signal?: AbortSignal,
): Promise<EventKpiResponse> => {
	const response = await apiClient(
		`/api/posthog/events/kpi?path=${encodeURIComponent(path)}`,
		{ signal },
	);
	if (!response.ok) {
		throw new Error("KPI 데이터를 불러오는 데 실패했습니다");
	}
	return response.json();
};

const useEventKpi = (path = "all"): UseQueryResult<EventKpiResponse, Error> => {
	return useQuery({
		queryKey: ["events", "kpi", path],
		queryFn: ({ signal }) => getEventKpi(path, signal),
		staleTime: EVENT_STATS_REFETCH_INTERVAL_MS,
		refetchOnWindowFocus: false,
		refetchInterval: EVENT_STATS_REFETCH_INTERVAL_MS,
	});
};

export { getEventKpi, useEventKpi };
