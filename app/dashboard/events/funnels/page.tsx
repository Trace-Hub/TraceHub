import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { ReactElement } from "react";
import { getFunnelServer } from "@/entities/event/api/getFunnelServer";
import { FUNNEL_CONFIG } from "@/shared/config/funnelConfig";
import FunnelsDashboard from "@/views/posthog/funnels/FunnelsDashboard";

const FunnelsPage = async (): Promise<ReactElement> => {
	const queryClient = new QueryClient();
	const defaultFunnelId = FUNNEL_CONFIG[0]?.id ?? "default";

	await queryClient.prefetchQuery({
		queryKey: ["events", "funnel", defaultFunnelId, "7d"],
		queryFn: () => getFunnelServer(defaultFunnelId, "7d"),
	});

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<FunnelsDashboard />
		</HydrationBoundary>
	);
};

export default FunnelsPage;
