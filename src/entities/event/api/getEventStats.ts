import {
	type InfiniteData,
	type UseInfiniteQueryResult,
	type UseQueryResult,
	useInfiniteQuery,
	useQuery,
} from "@tanstack/react-query";
import type { EventCategory } from "@/entities/event/model/eventCategory";
import type {
	EventStatsResponse,
	Period,
} from "@/entities/event/model/eventStats";
import { apiClient } from "@/shared/api/client";

// OverviewChart처럼 전체 이벤트 타입의 breakdown 합계가 필요한 소비처용 상한 —
// 무한스크롤 목록(useEventStats)과 달리 페이지네이션 없이 한 번에 가져온다
const ALL_EVENTS_LIMIT = 100;

const getEventStats = async (
	period: Period,
	path: string,
	category: EventCategory,
	search: string,
	cursor?: string,
	signal?: AbortSignal,
): Promise<EventStatsResponse> => {
	const searchParams = new URLSearchParams({ period, path });
	if (category !== "all") searchParams.set("category", category);
	if (search) searchParams.set("q", search);
	if (cursor) searchParams.set("cursor", cursor);

	const response = await apiClient(
		`/api/posthog/events?${searchParams.toString()}`,
		{ signal },
	);
	if (!response.ok) {
		throw new Error("이벤트 데이터를 불러오는 데 실패했습니다");
	}
	return response.json();
};

type EventStatsInfiniteData = InfiniteData<
	EventStatsResponse,
	string | undefined
>;

const useEventStats = (
	period: Period,
	path = "all",
	category: EventCategory = "all",
	search = "",
): UseInfiniteQueryResult<EventStatsInfiniteData, Error> => {
	return useInfiniteQuery<
		EventStatsResponse,
		Error,
		EventStatsInfiniteData,
		readonly unknown[],
		string | undefined
	>({
		queryKey: ["events", "stats", period, path, category, search],
		queryFn: ({ pageParam, signal }) =>
			getEventStats(period, path, category, search, pageParam, signal),
		initialPageParam: undefined,
		getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
		refetchOnWindowFocus: false,
		// period/path/category/검색 변경 시 재시도 지연(최대 ~7초)만큼 에러 상태 노출이 늦어져
		// 스켈레톤이 오래 떠 있는 것처럼 보이므로, 실패 시 1회만 재시도하고 바로 에러 UI를 보여준다
		retry: 1,
	});
};

const getAllEventStats = async (
	period: Period,
	path: string,
	category: EventCategory = "all",
	signal?: AbortSignal,
): Promise<EventStatsResponse> => {
	const searchParams = new URLSearchParams({
		period,
		path,
		limit: String(ALL_EVENTS_LIMIT),
	});
	if (category !== "all") searchParams.set("category", category);

	const response = await apiClient(
		`/api/posthog/events?${searchParams.toString()}`,
		{ signal },
	);
	if (!response.ok) {
		throw new Error("이벤트 데이터를 불러오는 데 실패했습니다");
	}
	return response.json();
};

const useAllEventStats = (
	period: Period,
	path = "all",
	category: EventCategory = "all",
): UseQueryResult<EventStatsResponse, Error> => {
	return useQuery({
		queryKey: ["events", "stats", "all", period, path, category],
		queryFn: ({ signal }) => getAllEventStats(period, path, category, signal),
		retry: 1,
	});
};

export type { EventStatsInfiniteData };
export { getAllEventStats, getEventStats, useAllEventStats, useEventStats };
