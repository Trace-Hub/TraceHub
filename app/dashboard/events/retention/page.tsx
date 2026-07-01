import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query"
import type { ReactElement } from "react"
import { getRetentionServer } from "@/entities/event/api/getRetentionServer"
import RetentionDashboard from "@/views/posthog/RetentionDashboard"

const RetentionPage = async (): Promise<ReactElement> => {
	const queryClient = new QueryClient()

	await queryClient.prefetchQuery({
		queryKey: ["events", "retention"],
		queryFn: getRetentionServer,
	})

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<RetentionDashboard />
		</HydrationBoundary>
	)
}

export default RetentionPage
