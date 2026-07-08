import type { ReactElement } from "react";
import Skeleton from "@/shared/ui/skeleton";

const EventStatsDashboardSkeleton = (): ReactElement => {
	return (
		<div className="flex flex-col gap-6">
			{[0, 1, 2].map((i) => (
				<div
					key={i}
					className="flex flex-col gap-4 p-4 rounded-xl border border-border-subtle bg-bg-card"
				>
					<div className="flex items-center justify-between">
						<Skeleton className="h-5 w-32" />
						<Skeleton className="h-5 w-14" />
					</div>
					<Skeleton className="h-4 w-56" />
					<Skeleton className="h-36 w-full" />
				</div>
			))}
		</div>
	);
};

export default EventStatsDashboardSkeleton;
