import type { ReactElement } from "react"
import Skeleton from "@/shared/ui/skeleton"

const RetentionDashboardSkeleton = (): ReactElement => (
	<div className="flex flex-col gap-6 p-6 h-full">
		{/* 헤더 */}
		<div className="flex flex-col gap-2">
			<Skeleton className="h-5 w-20 rounded" />
			<Skeleton className="h-4 w-80 rounded" />
		</div>

		{/* KPI 카드 4개 */}
		<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
			{[0, 1, 2, 3].map((i) => (
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
		{/* 차트 2개 */}
		<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
			{[0, 1].map((i) => (
				<div
					key={i}
					className="flex flex-col gap-3 p-4 rounded-xl border border-border-subtle bg-bg-card"
				>
					<Skeleton className="h-4 w-36 rounded" />
					<Skeleton className="h-52 w-full rounded" />
				</div>
			))}
		</div>
		{/* 히트맵 */}
		<div className="flex flex-col gap-3">
			<Skeleton className="h-4 w-24 rounded" />
			<div className="rounded-xl border border-border-subtle bg-bg-card p-4 flex flex-col gap-2">
				{[0, 1, 2, 3, 4, 5].map((i) => (
					<Skeleton key={i} className="h-8 w-full rounded" />
				))}
			</div>
		</div>
	</div>
)

export default RetentionDashboardSkeleton
