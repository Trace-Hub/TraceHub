import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query"
import type { ReactElement } from "react"
import { fetchEventKpiServer } from "@/entities/event/api/fetchEventKpiServer"
import { fetchEventStatsServer } from "@/entities/event/api/fetchEventStatsServer"
import { buildPathFilter } from "@/shared/lib/posthogServer"
import TrendsDashboard from "@/views/posthog/TrendsDashboard"

const TrendsPage = async (): Promise<ReactElement> => {
	const queryClient = new QueryClient()
	const pathFilter = buildPathFilter()

	await Promise.all([
		queryClient.prefetchQuery({
			queryKey: ["events", "kpi", "all"],
			queryFn: () => fetchEventKpiServer(pathFilter),
		}),
		queryClient.prefetchQuery({
			queryKey: ["events", "stats", "day", "all"],
			queryFn: () => fetchEventStatsServer("day", pathFilter),
		}),
	])

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<TrendsDashboard />
		</HydrationBoundary>
	)
}

export default TrendsPage
