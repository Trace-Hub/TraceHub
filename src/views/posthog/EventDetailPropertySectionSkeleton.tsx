import type { ReactElement } from "react";
import Skeleton from "@/shared/ui/skeleton";

const EventDetailPropertySectionSkeleton = (): ReactElement => {
	return (
		<div className="flex flex-col gap-3">
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
	);
};

export default EventDetailPropertySectionSkeleton;
