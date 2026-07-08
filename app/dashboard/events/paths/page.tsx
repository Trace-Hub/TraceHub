import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query"
import type { ReactElement } from "react"
import { getPathFlowsServer } from "@/entities/event/api/getPathFlowsServer"
import { getPathsKpiServer } from "@/entities/event/api/getPathsKpiServer"
import type { PathStepCount } from "@/entities/event/model/paths"
import PathsDashboard from "@/views/posthog/paths/PathsDashboard"

const DEFAULT_PERIOD = "week"
const DEFAULT_STEP_COUNT: PathStepCount = 3
// PathsDashboard의 기본 시작점("all")과 반드시 일치해야 SSR 캐시가 재사용된다
const DEFAULT_START_PATH = "all"

const PathsPage = async (): Promise<ReactElement> => {
	const queryClient = new QueryClient()

	await Promise.all([
		queryClient.prefetchQuery({
			queryKey: ["events", "paths", "kpi", DEFAULT_PERIOD],
			queryFn: () => getPathsKpiServer(DEFAULT_PERIOD),
		}),
		queryClient.prefetchQuery({
			queryKey: ["events", "paths", DEFAULT_START_PATH, DEFAULT_PERIOD, DEFAULT_STEP_COUNT],
			queryFn: () => getPathFlowsServer(null, DEFAULT_PERIOD, DEFAULT_STEP_COUNT),
		}),
	])

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<PathsDashboard />
		</HydrationBoundary>
	)
}

export default PathsPage
