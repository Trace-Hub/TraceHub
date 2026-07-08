import type { ReactElement } from "react";
import Skeleton from "@/shared/ui/skeleton";

interface FunnelDashboardSkeletonProps {
	stepCount?: number;
}

const FunnelDashboardSkeleton = ({
	stepCount = 4,
}: FunnelDashboardSkeletonProps): ReactElement => (
	<div className="flex flex-col gap-6">
		{/* KPI 카드 2개 */}
		<div className="grid grid-cols-2 gap-4">
			{[0, 1].map((i) => (
				<div
					key={i}
					className="flex flex-col gap-2 p-4 rounded-xl border border-border-subtle bg-bg-card"
				>
					<Skeleton className="h-3 w-24 rounded" />
					<Skeleton className="h-7 w-20 rounded" />
					<Skeleton className="h-3 w-16 rounded" />
				</div>
			))}
		</div>

		{/* 퍼널 카드 + 시각화 */}
		<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
			{/* 단계 카드 (2/3) */}
			<div className="lg:col-span-2 flex flex-col gap-3">
				{Array.from({ length: stepCount }, (_, i) => (
					<div
						key={i}
						className="flex flex-col gap-2 p-4 rounded-xl border border-border-subtle bg-bg-card"
					>
						<div className="flex items-center justify-between">
							<Skeleton className="h-4 w-32 rounded" />
							<Skeleton className="h-4 w-20 rounded" />
						</div>
						<Skeleton className="h-1.5 w-full rounded-full" />
					</div>
				))}
			</div>

			{/* 시각화 (1/3) */}
			<div className="flex flex-col justify-center gap-3 p-4 rounded-xl border border-border-subtle bg-bg-card">
				{[100, 72, 45, 28].map((w) => (
					<div key={w} className="flex flex-col gap-1">
						<Skeleton className="h-3 w-8 rounded ml-auto" />
						<Skeleton className="h-8 rounded" style={{ width: `${w}%` }} />
					</div>
				))}
			</div>
		</div>

		{/* 트렌드 차트 */}
		<div className="flex flex-col gap-3 p-4 rounded-xl border border-border-subtle bg-bg-card">
			<Skeleton className="h-4 w-36 rounded" />
			<Skeleton className="h-48 w-full rounded" />
		</div>
	</div>
);

export default FunnelDashboardSkeleton;
