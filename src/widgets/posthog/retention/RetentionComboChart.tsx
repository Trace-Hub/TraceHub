"use client"

import type { ReactElement } from "react"
import {
	Bar,
	CartesianGrid,
	ComposedChart,
	Line,
	XAxis,
	YAxis,
} from "recharts"
import {
	type RetentionCohort,
	formatShortDate,
} from "@/entities/event/model/retention"
import { cn } from "@/shared/lib/utils"
import EmptyState from "@/shared/ui/EmptyState"
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/shared/ui/chart"

interface RetentionComboChartProps {
	cohorts: RetentionCohort[]
	className?: string
}

const config: ChartConfig = {
	cohortSize: { label: "신규 사용자", color: "var(--color-primary)" },
	week1Retention: { label: "W1 잔존율", color: "var(--color-success)" },
}

const RetentionComboChart = ({
	cohorts,
	className,
}: RetentionComboChartProps): ReactElement => {
	// W1 데이터가 있는 코호트만 표시
	const chartData = cohorts
		.filter((c) => c.retentions[1] !== null)
		.map((c) => ({
			week: formatShortDate(c.weekStart),
			cohortSize: c.cohortSize,
			// filter로 null을 제거했으나 map 콜백에서 타입이 자동으로 좁혀지지 않음
			week1Retention: c.retentions[1] as number,
		}))

	if (chartData.length === 0) {
		return (
			<div className={cn("flex h-52 items-center justify-center", className)}>
				<EmptyState message="W1 리텐션 데이터가 아직 없습니다" />
			</div>
		)
	}

	return (
		<div className={cn("flex flex-col gap-2", className)}>
			<div className="flex items-center gap-4 text-caption text-text-secondary">
				<div className="flex items-center gap-1.5">
					<div className="h-2.5 w-2.5 rounded-sm bg-primary/40" />
					<span>신규 사용자 (명)</span>
				</div>
				<div className="flex items-center gap-1.5">
					<div className="h-0.5 w-4 rounded-full bg-success" />
					<span>Week 1 잔존율 (%)</span>
				</div>
			</div>
			<ChartContainer config={config} className="aspect-auto h-52">
				<ComposedChart data={chartData} margin={{ top: 10, left: -10, right: 20 }}>
					<CartesianGrid vertical={false} stroke="var(--color-border-subtle)" />
					<XAxis
						dataKey="week"
						tickLine={false}
						axisLine={false}
						tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }}
					/>
					<YAxis
						yAxisId="left"
						tickLine={false}
						axisLine={false}
						tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }}
						width={40}
					/>
					<YAxis
						yAxisId="right"
						orientation="right"
						domain={[0, 100]}
						tickLine={false}
						axisLine={false}
						tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }}
						tickFormatter={(v: number) => `${v}%`}
						width={36}
					/>
					<ChartTooltip
						content={
							<ChartTooltipContent
								className="bg-bg-card border-border-base shadow-md"
								formatter={(value, name) => {
									if (name === "week1Retention")
										return [`${value}%`, ": Week 1 잔존율"]
									// ChartTooltipContent formatter의 value 타입이 number | string이라 cast 필요
									return [(value as number).toLocaleString(), "명: 신규 사용자"]
								}}
							/>
						}
						isAnimationActive={false}
					/>
					<Bar
						yAxisId="left"
						dataKey="cohortSize"
						fill="var(--color-primary)"
						fillOpacity={0.25}
						radius={[2, 2, 0, 0]}
						isAnimationActive
						animationDuration={800}
						animationEasing="ease-out"
					/>
					<Line
						yAxisId="right"
						type="monotone"
						dataKey="week1Retention"
						stroke="var(--color-success)"
						strokeWidth={2}
						dot={{ fill: "var(--color-success)", r: 3, strokeWidth: 0 }}
						activeDot={{ r: 4, strokeWidth: 0 }}
						isAnimationActive
						animationDuration={800}
						animationEasing="ease-out"
					/>
				</ComposedChart>
			</ChartContainer>
		</div>
	)
}

export default RetentionComboChart
