import { type UseQueryResult, useQuery } from "@tanstack/react-query";
import { EVENT_STATS_REFETCH_INTERVAL_MS } from "@/entities/event/model/eventStats";
import type {
	LifecyclePeriod,
	LifecycleResponse,
} from "@/entities/event/model/lifecycle";
import { apiClient } from "@/shared/api/client";

const getLifecycle = async (
	period: LifecyclePeriod,
	signal?: AbortSignal,
): Promise<LifecycleResponse> => {
	const response = await apiClient(`/api/posthog/lifecycle?period=${period}`, {
		signal,
	});
	if (!response.ok) {
		throw new Error("라이프사이클 데이터를 불러오는 데 실패했습니다");
	}
	return response.json();
};

const useLifecycle = (
	period: LifecyclePeriod,
): UseQueryResult<LifecycleResponse, Error> => {
	return useQuery({
		queryKey: ["lifecycle", period],
		queryFn: ({ signal }) => getLifecycle(period, signal),
		staleTime: EVENT_STATS_REFETCH_INTERVAL_MS,
		refetchOnWindowFocus: false,
	});
};

export { getLifecycle, useLifecycle };
