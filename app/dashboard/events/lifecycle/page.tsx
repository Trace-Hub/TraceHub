import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { ReactElement } from "react";
import { getLifecycleServer } from "@/entities/event/api/getLifecycleServer";
import LifecycleDashboard from "@/views/posthog/lifecycle/LifecycleDashboard";

const LifecyclePage = async (): Promise<ReactElement> => {
	const queryClient = new QueryClient();

	await queryClient.prefetchQuery({
		queryKey: ["lifecycle", "week"],
		queryFn: () => getLifecycleServer("week"),
	});

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<LifecycleDashboard />
		</HydrationBoundary>
	);
};

export default LifecyclePage;
