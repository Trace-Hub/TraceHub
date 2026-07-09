"use client"

import type { ReactElement } from "react"
import { Bar, BarChart, XAxis, YAxis } from "recharts"
import { cn } from "@/shared/lib/utils"
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/shared/ui/chart"

// NOTE(재사용 권장):
//   src/views/sentry/ErrorTagChart 가 본 컴포넌트와 사실상 동일한 구현이다.
//   에러 도메인 측 작업 시 본 컴포넌트로 교체 권장 — ErrorTagValue 의 형태가
//   PercentageBarChartItem 과 동일해 별도 매핑 없이 전달 가능하다.

interface PercentageBarChartItem {
	value: string
	count: number
	percentage: number
}

type BarMetric = "percentage" | "count"

interface PercentageBarChartProps {
	values: PercentageBarChartItem[]
	// 표시할 수치 — "percentage"(0~100%) 또는 "count"(빈도). 기본 "percentage"
	metric?: BarMetric
	// 항목별 색상 팔레트 — 미지정 시 모든 막대를 단일 primary 색으로 표시
	colors?: readonly string[]
	className?: string
}

const CONFIG_BY_METRIC: Record<BarMetric, ChartConfig> = {
	percentage: { percentage: { label: "비율", color: "var(--color-primary)" } },
	count: { count: { label: "빈도", color: "var(--color-primary)" } },
}

const PercentageBarChart = ({
	values,
	metric = "percentage",
	colors,
	className,
}: PercentageBarChartProps): ReactElement => {
	const getColor = (index: number): string =>
		colors && colors.length > 0 ? colors[index % colors.length] : "var(--color-primary)"

	// Recharts 가 데이터의 fill/stroke 필드를 항목별로 자동 적용 (deprecated <Cell> 대체)
	const chartData = values.map((v, i) => ({
		label: v.value,
		percentage: v.percentage,
		count: v.count,
		fill: getColor(i),
		stroke: getColor(i),
	}))

	const isPercentage = metric === "percentage"

	return (
		<ChartContainer
			config={CONFIG_BY_METRIC[metric]}
			className={cn("aspect-auto", className)}
			// 항목 수에 따라 동적으로 높이 조정 (Tailwind 클래스로 표현 불가)
			style={{ height: Math.max(chartData.length * 48, 80) }}
		>
			<BarChart
				data={chartData}
				layout="vertical"
				accessibilityLayer
				margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
			>
				<XAxis
					type="number"
					domain={isPercentage ? [0, 100] : undefined}
					ticks={isPercentage ? [0, 25, 50, 75, 100] : undefined}
					tickLine={false}
					axisLine={false}
					tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }}
					tickFormatter={
						isPercentage ? (v) => `${v}%` : (v) => Number(v).toLocaleString()
					}
				/>
				<YAxis
					type="category"
					dataKey="label"
					tickLine={false}
					axisLine={false}
					tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }}
					width={80}
				/>
				<ChartTooltip
					cursor={{ fill: "var(--color-bg-hover)" }}
					content={
						<ChartTooltipContent className="bg-bg-card border-border-base shadow-md" />
					}
					isAnimationActive={false}
					position={{ y: 0 }}
				/>
				<Bar
					dataKey={metric}
					radius={[0, 4, 4, 0]}
					fillOpacity={0.85}
					strokeWidth={1}
					isAnimationActive
					animationDuration={800}
					animationEasing="ease-out"
				/>
			</BarChart>
		</ChartContainer>
	)
}

export default PercentageBarChart
export type { PercentageBarChartItem }
