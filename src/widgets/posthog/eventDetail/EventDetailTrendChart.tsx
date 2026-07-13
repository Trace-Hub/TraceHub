"use client"

import type { ReactElement } from "react"
import {
	Area,
	AreaChart,
	CartesianGrid,
	Legend,
	XAxis,
	YAxis,
} from "recharts"
import type { EventTrendPoint } from "@/entities/event/model/eventStats"
import {
	BREAKPOINT_TO_INTERVAL_HOURS,
	getYAxisTicks,
} from "@/entities/event/model/eventStatsUtils"
import useBreakpoint from "@/shared/hooks/useBreakpoint"
import { cn } from "@/shared/lib/utils"
import type { Period as TabPeriod } from "@/shared/ui/PeriodSelector"
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/shared/ui/chart"

interface EventDetailTrendChartProps {
	trend: EventTrendPoint[]
	period: TabPeriod
	className?: string
}

const config: ChartConfig = {
	total: { label: "총 발생 횟수", color: "var(--color-primary)" },
	unique: { label: "고유 유저 수", color: "var(--color-success)" },
}

const EventDetailTrendChart = ({
	trend,
	period,
	className,
}: EventDetailTrendChartProps): ReactElement => {
	const breakpoint = useBreakpoint()
	const isHourly = period === "오늘"

	const maxValue = Math.max(...trend.map((t) => t.total), 0)
	const ticks = getYAxisTicks(maxValue)

	// total·unique는 시간대별로 이미 집계된 countDistinct 값이라 구간을 합산하면 중복 카운트가
	// 생기므로(EventBarChart의 groupBreakdownByInterval과 달리) 데이터는 그대로 두고
	// X축에 표시하는 라벨 밀도만 반응형으로 조정한다. 항상 마지막 인덱스(23시)를 강제로
	// 끼워넣지도 않는다 — 그러면 간격이 안 맞는 tablet(2h)/mobile(4h)에서 23시 라벨만
	// 따로 튀어나와 간격이 깨져 보였다
	const xAxisTicks = isHourly
		? trend
				.filter((_, i) => i % BREAKPOINT_TO_INTERVAL_HOURS[breakpoint] === 0)
				.map((t) => t.label)
		: trend.length > 7
			? trend
					.filter((_, i) => i % 5 === 0 || i === trend.length - 1)
					.map((t) => t.label)
			: trend.map((t) => t.label)

	return (
		<ChartContainer config={config} className={cn("aspect-auto h-52", className)}>
			<AreaChart data={trend} accessibilityLayer margin={{ top: 10, left: -20, right: 10 }}>
				<defs>
					<linearGradient id="gradientTotal" x1="0" y1="0" x2="0" y2="1">
						<stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
						<stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
					</linearGradient>
					<linearGradient id="gradientUnique" x1="0" y1="0" x2="0" y2="1">
						<stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.3} />
						<stop offset="95%" stopColor="var(--color-success)" stopOpacity={0} />
					</linearGradient>
				</defs>
				<CartesianGrid vertical={false} stroke="var(--color-border-subtle)" />
				<XAxis
					dataKey="label"
					ticks={xAxisTicks}
					tickLine={false}
					axisLine={false}
					tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }}
				/>
				<YAxis
					ticks={ticks}
					domain={[0, ticks[ticks.length - 1]]}
					tickLine={false}
					axisLine={false}
					tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }}
				/>
				<ChartTooltip
					cursor={{ stroke: "var(--color-border-base)", strokeWidth: 1 }}
					content={<ChartTooltipContent indicator="line" className="bg-bg-card border-border-base shadow-md" />}
					isAnimationActive={false}
				/>
				<Area
					type="monotone"
					dataKey="total"
					stroke="var(--color-primary)"
					strokeWidth={2}
					fill="url(#gradientTotal)"
					dot={false}
					activeDot={{ r: 4, fill: "var(--color-primary)", strokeWidth: 0 }}
					isAnimationActive
					animationDuration={800}
					animationEasing="ease-out"
				/>
				<Area
					type="monotone"
					dataKey="unique"
					stroke="var(--color-success)"
					strokeWidth={2}
					fill="url(#gradientUnique)"
					dot={false}
					activeDot={{ r: 4, fill: "var(--color-success)", strokeWidth: 0 }}
					isAnimationActive
					animationDuration={800}
					animationEasing="ease-out"
				/>
				<Legend
					iconType="line"
					iconSize={12}
					formatter={(value) => config[value]?.label ?? value}
					wrapperStyle={{ fontSize: 11, color: "var(--color-text-secondary)" }}
				/>
			</AreaChart>
		</ChartContainer>
	)
}

export default EventDetailTrendChart
