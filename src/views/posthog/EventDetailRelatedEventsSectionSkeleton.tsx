import type { ReactElement } from "react";
import { Skeleton } from "@/shared/ui/skeleton";

const EventDetailRelatedEventsSectionSkeleton = (): ReactElement => {
	return (
		<div className="flex flex-col gap-3 md:flex-row">
			<div className="flex flex-col gap-2 flex-1 p-4 rounded-xl border border-border-base bg-bg-base">
				<Skeleton className="h-3 w-20" />
				<Skeleton className="h-40 w-full" />
			</div>
			<div className="flex flex-col gap-2 flex-1 p-4 rounded-xl border border-border-base bg-bg-base">
				<Skeleton className="h-3 w-20" />
				<div className="flex flex-col gap-3 pt-2">
					{[0, 1, 2].map((i) => (
						<div key={i} className="flex flex-col gap-2">
							<div className="flex justify-between">
								<Skeleton className="h-3 w-18" />
								<Skeleton className="h-3 w-8" />
							</div>
							<Skeleton className="h-5 w-full" />
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default EventDetailRelatedEventsSectionSkeleton;
