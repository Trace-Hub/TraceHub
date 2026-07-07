import type { ReactElement } from "react"
import Skeleton from "@/shared/ui/skeleton"

const PathsDashboardSkeleton = (): ReactElement => (
	<div className="flex flex-col gap-6 p-6 h-full">
		{/* 헤더 */}
		<div className="flex flex-col gap-2">
			<Skeleton className="h-5 w-24 rounded" />
			<Skeleton className="h-4 w-80 rounded" />
		</div>

		{/* KPI 카드 2개 */}
		<div className="grid grid-cols-2 gap-4">
			{[0, 1].map((i) => (
				<div
					key={i}
					className="flex flex-col gap-2 p-4 rounded-xl border border-border-subtle bg-bg-card"
				>
					<Skeleton className="h-3 w-24 rounded" />
					<Skeleton className="h-7 w-40 rounded" />
					<Skeleton className="h-3 w-20 rounded" />
				</div>
			))}
		</div>

		{/* 경로 흐름 영역 */}
		<div className="flex flex-col gap-3">
			<div className="flex items-center justify-between">
				<Skeleton className="h-4 w-20 rounded" />
				<Skeleton className="h-8 w-32 rounded-md" />
			</div>
			<Skeleton className="h-96 w-full rounded-xl" />
		</div>
	</div>
)

export default PathsDashboardSkeleton
