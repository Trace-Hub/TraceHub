import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import type { ReactElement } from "react";
import { fetchEventKpiServer } from "@/entities/event/api/fetchEventKpiServer";
import { fetchEventStatsServer } from "@/entities/event/api/fetchEventStatsServer";
import type { EventStatsResponse } from "@/entities/event/model/eventStats";
import { buildPathFilter } from "@/shared/lib/posthogServer";
import TrendsDashboard from "@/views/posthog/trends/TrendsDashboard";

const TrendsPage = async (): Promise<ReactElement> => {
	const queryClient = new QueryClient();
	const pathFilter = buildPathFilter();

	await Promise.all([
		queryClient.prefetchQuery({
			queryKey: ["events", "kpi", "all"],
			queryFn: () => fetchEventKpiServer(pathFilter),
		}),
		// TrendsDashboard 초기 상태(period="day", path="all", category="all", search="")와
		// queryKey가 일치해야 useInfiniteQuery가 이 prefetch 캐시를 그대로 재사용한다
		queryClient.prefetchInfiniteQuery({
			queryKey: ["events", "stats", "day", "all", "all", ""],
			queryFn: ({ pageParam }) =>
				fetchEventStatsServer("day", pathFilter, "all", "", pageParam ?? null),
			initialPageParam: undefined as string | undefined,
			getNextPageParam: (lastPage: EventStatsResponse) =>
				lastPage.nextCursor ?? undefined,
		}),
	]);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<TrendsDashboard />
		</HydrationBoundary>
	);
};

export default TrendsPage;
