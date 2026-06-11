"use client";

import type { ReactElement } from "react";
import {
	CartesianGrid,
	Line,
	LineChart,
	XAxis,
	YAxis,
} from "recharts";
import type { EventStats } from "@/entities/event/model/eventStats";
import { buildCountData } from "@/views/posthog/model/eventChartUtils";
import { CHART_COLOR_PALETTE } from "@/shared/config/chartColors";
import { getEventLabel } from "@/shared/config/eventLabel";
import { cn } from "@/shared/lib/utils";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/shared/ui/chart";
import SurfaceIcon from "@/shared/ui/icons/SurfaceIcon";

const COMPARISON_EVENTS = [
	"$pageview",
	"button_clicked",
	"form_submitted",
	"link_clicked",
	"tab_changed",
];

interface EventComparisonChartProps {
	events: EventStats[];
	className?: string;
}

const EventComparisonChart = ({
	events,
	className,
}: EventComparisonChartProps): ReactElement => {
	const filteredEvents = events.filter((ev) =>
		COMPARISON_EVENTS.includes(ev.event),
	);
	const breakdown = filteredEvents[0]?.breakdown ?? [];
	const xAxisTicks =
		breakdown.length > 7
			? breakdown
					.filter((_, i) => i % 5 === 0 || i === breakdown.length - 1)
					.map((b) => b.label)
			: breakdown.map((b) => b.label);

	const chartData = buildCountData(filteredEvents);

	const config: ChartConfig = Object.fromEntries(
		filteredEvents.map((ev, i) => [
			ev.event,
			{
				label: getEventLabel(ev.event),
				color: CHART_COLOR_PALETTE[i % CHART_COLOR_PALETTE.length],
			},
		]),
	);

	return (
		<div
			className={cn(
				"flex flex-col gap-3",
				"p-4 rounded-xl border border-border-subtle bg-bg-card",
				className,
			)}
		>
			<ChartContainer config={config} className="aspect-auto h-52">
				<LineChart
					data={chartData}
					accessibilityLayer
					margin={{ top: 10, left: -10, right: 20 }}
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
						tickLine={false}
						axisLine={false}
						tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }}
						tickFormatter={(v: number) =>
							v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${v}`
						}
					/>
					<ChartTooltip
						cursor={{ stroke: "var(--color-border-base)", strokeWidth: 1 }}
						content={<ChartTooltipContent indicator="line" className="bg-bg-card border-border-base shadow-md" />}
						isAnimationActive={false}
					/>
					{filteredEvents.map((ev, i) => (
						<Line
							key={ev.event}
							type="monotone"
							dataKey={ev.event}
							stroke={CHART_COLOR_PALETTE[i % CHART_COLOR_PALETTE.length]}
							strokeWidth={2}
							dot={false}
							activeDot={{
								r: 4,
								fill: CHART_COLOR_PALETTE[i % CHART_COLOR_PALETTE.length],
								strokeWidth: 0,
							}}
							isAnimationActive
							animationDuration={800}
							animationEasing="ease-out"
						/>
					))}
				</LineChart>
			</ChartContainer>

			<div className="flex flex-wrap gap-x-4 gap-y-1 px-2 justify-center">
				{filteredEvents.map((ev, i) => (
					<div key={ev.event} className="flex items-center gap-1.5">
						<SurfaceIcon
							color={CHART_COLOR_PALETTE[i % CHART_COLOR_PALETTE.length]}
							className="w-3.5 h-3.5"
						/>
						<span className="text-caption text-text-secondary">
							{getEventLabel(ev.event)}
						</span>
					</div>
				))}
			</div>

			<p className="text-caption text-text-tertiary">
				이벤트 유형별 발생 횟수 추이를 비교합니다.
			</p>
		</div>
	);
};

export default EventComparisonChart;
