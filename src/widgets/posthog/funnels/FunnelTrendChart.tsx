"use client";

import type { ReactElement } from "react";
import {
	CartesianGrid,
	Line,
	LineChart,
	ReferenceLine,
	XAxis,
	YAxis,
} from "recharts";
import type { FunnelTrendPoint } from "@/entities/event/model/funnel";
import { formatShortDate } from "@/shared/lib/formatters";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/shared/ui/chart";

interface FunnelTrendChartProps {
	trend: FunnelTrendPoint[];
}

const CHART_CONFIG: ChartConfig = {
	conversionRate: {
		label: "전환율",
		color: "var(--color-primary)",
	},
};

const calcAvg = (points: FunnelTrendPoint[]): number => {
	if (points.length === 0) return 0;
	return points.reduce((sum, p) => sum + p.conversionRate, 0) / points.length;
};

const FunnelTrendChart = ({ trend }: FunnelTrendChartProps): ReactElement => {
	const data = trend.map((p) => ({
		label: formatShortDate(p.date),
		conversionRate: p.conversionRate,
	}));

	const avg = calcAvg(trend);

	// 30일 이상이면 5일 간격으로 X축 틱 표시
	const xAxisTicks =
		data.length > 7
			? data
					.filter((_, i) => i % 5 === 0 || i === data.length - 1)
					.map((d) => d.label)
			: data.map((d) => d.label);

	return (
		<ChartContainer config={CHART_CONFIG} className="aspect-auto h-48 w-full">
			<LineChart
				data={data}
				accessibilityLayer
				margin={{ top: 10, left: -20, right: 20 }}
			>
				<CartesianGrid vertical={false} stroke="var(--color-border-subtle)" />
				<XAxis
					dataKey="label"
					ticks={xAxisTicks}
					tickLine={false}
					axisLine={false}
					tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }}
				/>
				<YAxis
					domain={[0, 100]}
					ticks={[0, 25, 50, 75, 100]}
					tickFormatter={(v: number) => `${v}%`}
					tickLine={false}
					axisLine={false}
					tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }}
				/>
				<ChartTooltip
					cursor={{ stroke: "var(--color-border-base)", strokeWidth: 1 }}
					content={
						<ChartTooltipContent
							className="bg-bg-card border-border-base shadow-md"
							formatter={(value) => [
								`${(value as number).toFixed(1)}%`,
								"전환율",
							]}
						/>
					}
					isAnimationActive={false}
				/>
				<ReferenceLine
					y={avg}
					stroke="var(--color-text-tertiary)"
					strokeDasharray="4 4"
					strokeWidth={1}
				/>
				<Line
					type="monotone"
					dataKey="conversionRate"
					stroke="var(--color-primary)"
					strokeWidth={2}
					dot={{ r: 3, fill: "var(--color-primary)", strokeWidth: 0 }}
					activeDot={{ r: 5, fill: "var(--color-primary)", strokeWidth: 0 }}
					isAnimationActive
					animationDuration={800}
					animationEasing="ease-out"
				/>
			</LineChart>
		</ChartContainer>
	);
};

export default FunnelTrendChart;
