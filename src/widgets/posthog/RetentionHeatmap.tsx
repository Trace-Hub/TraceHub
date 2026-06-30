"use client"

import type { ReactElement } from "react"
import {
	RETENTION_WEEKS,
	type RetentionCohort,
	formatWeekRange,
} from "@/entities/event/model/retention"
import { cn } from "@/shared/lib/utils"

interface RetentionHeatmapProps {
	cohorts: RetentionCohort[]
	className?: string
}

const getCellStyle = (rate: number | null, isW0: boolean): string => {
	if (rate === null) return "bg-bg-subtle text-text-disabled"
	if (isW0) return "bg-primary text-white font-medium"
	if (rate === 0) return "bg-primary/5 text-text-tertiary"
	if (rate <= 20) return "bg-primary/15 text-text-primary"
	if (rate <= 40) return "bg-primary/30 text-text-primary"
	if (rate <= 60) return "bg-primary/50 text-text-primary"
	if (rate <= 80) return "bg-primary/65 text-white"
	return "bg-primary/80 text-white"
}

const weekHeaders = Array.from({ length: RETENTION_WEEKS }, (_, i) => `Week ${i}`)

const RetentionHeatmap = ({
	cohorts,
	className,
}: RetentionHeatmapProps): ReactElement => {
	if (cohorts.length === 0) {
		return (
			<div
				className={cn(
					"flex items-center justify-center py-12 rounded-xl border border-border-subtle bg-bg-card text-text-tertiary text-body2",
					className,
				)}
			>
				데이터가 없습니다
			</div>
		)
	}

	const totalUsers = cohorts.reduce((sum, c) => sum + c.cohortSize, 0)

	return (
		<div
			className={cn(
				"overflow-x-auto rounded-xl border border-border-subtle bg-bg-card",
				className,
			)}
		>
			<table className="w-full border-collapse text-caption min-w-max">
				<thead>
					<tr className="border-b border-border-subtle">
						<th className="sticky left-0 z-10 bg-bg-card px-4 py-2.5 text-left font-normal min-w-36">
							<div className="flex flex-col gap-0.5">
								<span className="text-text-primary font-medium">모든 사용자</span>
								<span className="text-text-tertiary text-label">
									{totalUsers.toLocaleString()}명 사용자
								</span>
							</div>
						</th>
						{weekHeaders.map((h) => (
							<th
								key={h}
								className="px-3 py-2.5 text-center text-text-tertiary font-normal min-w-14"
							>
								{h}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{/* 코호트별 행 */}
					{cohorts.map((cohort) => (
						<tr
							key={cohort.weekStart}
							className="border-b border-border-subtle last:border-0 hover:brightness-95 transition-[filter]"
						>
							<td className="sticky left-0 z-10 bg-bg-card px-4 py-2">
								<div className="flex flex-col gap-0.5">
									<span className="text-text-secondary font-mono">
										{formatWeekRange(cohort.weekStart)}
									</span>
									<span className="text-text-tertiary text-label">
										{cohort.cohortSize.toLocaleString()}명 사용자
									</span>
								</div>
							</td>
							{cohort.retentions.map((rate, w) => {
								const count = cohort.counts[w]
								const isW0 = w === 0
								const cellClass = getCellStyle(rate, isW0)

								return (
									<td
										key={w}
										className={cn(
											"relative px-3 py-2 text-center font-mono tabular-nums group/cell",
											cellClass,
										)}
										aria-label={
											rate !== null ? `Week ${w} 잔존율 ${rate}%` : "데이터 없음"
										}
									>
										{rate !== null ? `${rate}%` : ""}
										{count !== null && !isW0 && (
											<div
												className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover/cell:block z-20"
												role="tooltip"
											>
												<div className="rounded-md bg-bg-overlay border border-border-subtle px-2 py-1 text-text-primary shadow-md whitespace-nowrap">
													{count.toLocaleString()}명
												</div>
											</div>
										)}
									</td>
								)
							})}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}

export default RetentionHeatmap
