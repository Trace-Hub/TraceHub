import type { ReactElement } from "react";
import Skeleton from "@/shared/ui/skeleton";

const LifecycleDashboardSkeleton = (): ReactElement => {
	return (
		<div className="flex flex-col gap-6">
			{/* 상단: Active User Base 카드 */}
			<div className="rounded-xl border border-border-subtle bg-bg-card p-5 flex flex-col gap-4">
				<div className="flex items-start justify-between gap-4">
					<div className="flex flex-col gap-2">
						<Skeleton className="h-5 w-36" />
						<Skeleton className="h-4 w-56" />
					</div>
					<div className="flex flex-col items-end gap-2">
						<Skeleton className="h-4 w-20" />
						<Skeleton className="h-8 w-24" />
						<Skeleton className="h-4 w-32" />
					</div>
				</div>
				<Skeleton className="h-6 w-full rounded-md" />
				<div className="flex gap-4">
					<Skeleton className="h-4 w-20" />
					<Skeleton className="h-4 w-24" />
					<Skeleton className="h-4 w-20" />
				</div>
			</div>

			{/* 중단: 세그먼트 카드 2행 */}
			{[0, 1].map((row) => (
				<div key={row} className="flex flex-col gap-2">
					<Skeleton className="h-4 w-16" />
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
						{[0, 1, 2].map((i) => (
							<div
								key={i}
								className="flex flex-col gap-2 p-4 rounded-xl border border-border-subtle bg-bg-card"
							>
								<Skeleton className="h-4 w-20" />
								<div className="flex items-end justify-between">
									<Skeleton className="h-7 w-20" />
									<Skeleton className="h-4 w-10" />
								</div>
								<Skeleton className="h-4 w-full" />
							</div>
						))}
					</div>
				</div>
			))}

			{/* 하단: 총 분포 차트 */}
			<div className="rounded-xl border border-border-subtle bg-bg-card p-5 flex flex-col gap-4">
				<div className="flex items-center justify-between">
					<Skeleton className="h-5 w-32" />
					<Skeleton className="h-4 w-20" />
				</div>
				<Skeleton className="h-8 w-full rounded-md" />
				<div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
					{[0, 1, 2, 3, 4, 5].map((i) => (
						<Skeleton key={i} className="h-4 w-full" />
					))}
				</div>
			</div>
		</div>
	);
};

export default LifecycleDashboardSkeleton;
