"use client"

import type { ReactElement } from "react"
import { Pie, PieChart } from "recharts"
import { cn } from "@/shared/lib/utils"
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/shared/ui/chart"

interface RetentionHalfPieChartProps {
	retainedUsersCount: number
	totalTrackedUsers: number
	className?: string
}

const config: ChartConfig = {}

const RetentionHalfPieChart = ({
	retainedUsersCount,
	totalTrackedUsers,
	className,
}: RetentionHalfPieChartProps): ReactElement => {
	const notRetained = Math.max(0, totalTrackedUsers - retainedUsersCount)
	const retainedPct =
		totalTrackedUsers > 0
			? Math.round((retainedUsersCount / totalTrackedUsers) * 1000) / 10
			: 0
	const notRetainedPct = Math.round((100 - retainedPct) * 10) / 10

	const chartData = [
		{
			name: "재방문",
			value: retainedUsersCount,
			pct: retainedPct,
			fill: "var(--color-success)",
		},
		{
			name: "미방문",
			value: notRetained,
			pct: notRetainedPct,
			fill: "var(--color-border-base)",
		},
	]

	return (
		<div className={cn("flex flex-col items-center gap-3", className)}>
			<ChartContainer config={config} className="aspect-auto h-36 w-full">
				<PieChart>
					<Pie
						data={chartData}
						startAngle={180}
						endAngle={0}
						cx="50%"
						cy="85%"
						outerRadius={100}
						innerRadius={55}
						dataKey="value"
						paddingAngle={2}
						strokeWidth={0}
						isAnimationActive
						animationDuration={800}
						animationEasing="ease-out"
					/>
					<ChartTooltip
						content={
							<ChartTooltipContent
								className="bg-bg-card border-border-base shadow-md"
								formatter={(_value, name, item) => (
									<>
										<div
											className="h-2.5 w-2.5 shrink-0 rounded-sm"
											// Recharts payload 타입이 unknown이나 tooltip 시점엔 항상 string
											style={{ background: item.payload?.fill as string }}
										/>
										<div className="flex flex-1 justify-between items-center leading-none gap-4">
											<span className="text-text-secondary">{name}</span>
											<span className="font-mono font-medium tabular-nums">
												{/* Recharts payload 타입이 unknown이므로 cast, undefined 시 0 폴백 */}
												{(item.payload?.pct as number) ?? 0}%
											</span>
										</div>
									</>
								)}
							/>
						}
					/>
				</PieChart>
			</ChartContainer>
			<div className="flex items-center gap-6 text-caption">
				<div className="flex items-center gap-1.5">
					<div className="h-2 w-2 rounded-full bg-success" />
					<span className="text-text-secondary">재방문 {retainedPct}%</span>
				</div>
				<div className="flex items-center gap-1.5">
					<div className="h-2 w-2 rounded-full border border-border-base" />
					<span className="text-text-secondary">미방문 {notRetainedPct}%</span>
				</div>
			</div>
		</div>
	)
}

export default RetentionHalfPieChart
