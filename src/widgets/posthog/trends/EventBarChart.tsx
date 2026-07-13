"use client";

import type { ReactElement } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { EventPeriodCount } from "@/entities/event/model/eventStats";
import {
	BREAKPOINT_TO_INTERVAL_HOURS,
	getYAxisTicks,
	groupBreakdownByInterval,
} from "@/entities/event/model/eventStatsUtils";
import useBreakpoint from "@/shared/hooks/useBreakpoint";
import { cn } from "@/shared/lib/utils";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/shared/ui/chart";

interface EventBarChartProps {
	breakdown: EventPeriodCount[];
	color: string;
	className?: string;
}

const EventBarChart = ({
	breakdown,
	color,
	className,
}: EventBarChartProps): ReactElement => {
	const breakpoint = useBreakpoint();
	const groupedBreakdown = groupBreakdownByInterval(
		breakdown,
		BREAKPOINT_TO_INTERVAL_HOURS[breakpoint],
	);
	const maxValue = Math.max(...groupedBreakdown.map((b) => b.count), 0);
	const ticks = getYAxisTicks(maxValue);
	const chartData = groupedBreakdown.map((b) => ({ ...b }));

	const config: ChartConfig = {
		count: { label: "발생 횟수", color },
	};

	return (
		<ChartContainer
			config={config}
			className={cn("aspect-auto h-52", className)}
		>
			<BarChart
				data={chartData}
				accessibilityLayer
				margin={{ top: 10, left: -20 }}
			>
				<CartesianGrid vertical={false} stroke="var(--color-border-subtle)" />
				<XAxis
					dataKey="label"
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
					cursor={{ fill: "var(--color-bg-hover)" }}
					content={<ChartTooltipContent className="bg-bg-card border-border-base shadow-md" />}
					isAnimationActive={false}
				/>
				<Bar
					dataKey="count"
					fill="var(--color-count)"
					fillOpacity={0.85}
					radius={[2, 2, 0, 0]}
					isAnimationActive
					animationDuration={800}
					animationEasing="ease-out"
				/>
			</BarChart>
		</ChartContainer>
	);
};

export default EventBarChart;
