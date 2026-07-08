"use client"

import type { ReactElement } from "react"
import { Legend, Pie, PieChart } from "recharts"
import { CHART_COLOR_PALETTE } from "@/shared/config/chartColors"
import { cn } from "@/shared/lib/utils"
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/shared/ui/chart"

interface RelatedEventSlice {
	value: string
	count: number
}

interface EventRelatedDonutChartProps {
	data: RelatedEventSlice[]
	// 항목별 색상 — 외부에서 주입해 옆 차트(막대)와 색상 통일 가능. 미지정 시 기본 팔레트 사용
	colors?: readonly string[]
	className?: string
}

const EventRelatedDonutChart = ({
	data,
	colors = CHART_COLOR_PALETTE,
	className,
}: EventRelatedDonutChartProps): ReactElement => {
	const config: ChartConfig = Object.fromEntries(
		data.map((d, i) => [
			d.value,
			{ label: d.value, color: colors[i % colors.length] },
		]),
	)

	// 5개 이벤트 간 상대 비율(합산 100%)로 정규화 — 각 항목의 공동 발생률과 다름
	const totalCount = data.reduce((sum, d) => sum + d.count, 0)

	// Recharts 가 deprecated <Cell> 대신 데이터의 fill 필드를 자동 적용
	const chartData = data.map((d, i) => ({
		name: d.value,
		value: d.count,
		normalizedPct: totalCount > 0 ? parseFloat(((d.count / totalCount) * 100).toFixed(1)) : 0,
		fill: colors[i % colors.length],
	}))

	return (
		<ChartContainer
			config={config}
			className={cn("aspect-auto h-56", className)}
		>
			<PieChart>
				<Pie
					data={chartData}
					dataKey="value"
					nameKey="name"
					cx="50%"
					cy="45%"
					innerRadius={60}
					outerRadius={88}
					paddingAngle={3}
					fillOpacity={0.9}
					stroke="none"
					isAnimationActive
					animationDuration={800}
					animationEasing="ease-out"
				/>
				<ChartTooltip
					content={
						<ChartTooltipContent
							className="bg-bg-card border-border-base shadow-md"
							nameKey="name"
							formatter={(_value, name, item) => (
								<>
									<div
										className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
										style={{ background: item.payload?.fill }}
									/>
									<div className="flex flex-1 justify-between items-center leading-none">
										<span className="text-text-secondary">{name}</span>
										<span className="font-mono font-medium tabular-nums ml-4">
											{Number(item.payload?.normalizedPct ?? 0)}%
										</span>
									</div>
								</>
							)}
						/>
					}
				/>
				<Legend
					iconType="circle"
					iconSize={8}
					formatter={(value) => value}
					wrapperStyle={{ fontSize: 11, color: "var(--color-text-secondary)", paddingTop: 8 }}
				/>
			</PieChart>
		</ChartContainer>
	)
}

export default EventRelatedDonutChart
