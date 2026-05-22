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
import type { EventStats } from "@/entities/event/model/eventStats";
import { getEventLabel } from "@/shared/config/eventLabel";
import { cn } from "@/shared/lib/utils";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/shared/ui/chart";
import SurfaceIcon from "@/shared/ui/icons/SurfaceIcon";

const CHART_COLORS = [
	"var(--color-primary)",
	"var(--color-success)",
	"var(--color-warning)",
	"var(--color-error)",
	"var(--color-surge)",
];

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

function buildComparisonData(
	events: EventStats[],
): Record<string, string | number>[] {
	const breakdown = events[0]?.breakdown ?? [];
	return breakdown.map((b, i) => {
		const point: Record<string, string | number> = { label: b.label };
		for (const ev of events) {
			const firstCount = ev.breakdown[0]?.count ?? 0;
			const currentCount = ev.breakdown[i]?.count ?? 0;
			point[ev.event] =
				firstCount === 0
					? 0
					: Math.round(((currentCount - firstCount) / firstCount) * 100);
		}
		return point;
	});
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

	const chartData = buildComparisonData(filteredEvents);

	const config: ChartConfig = Object.fromEntries(
		filteredEvents.map((ev, i) => [
			ev.event,
			{
				label: getEventLabel(ev.event),
				color: CHART_COLORS[i % CHART_COLORS.length],
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
						tickFormatter={(v) => `${v}%`}
					/>
					<ReferenceLine
						y={0}
						stroke="var(--color-border-base)"
						strokeWidth={1}
					/>
					<ChartTooltip
						cursor={{ stroke: "var(--color-border-base)", strokeWidth: 1 }}
						content={<ChartTooltipContent indicator="line" />}
					/>
					{filteredEvents.map((ev, i) => (
						<Line
							key={ev.event}
							type="monotone"
							dataKey={ev.event}
							stroke={CHART_COLORS[i % CHART_COLORS.length]}
							strokeWidth={2}
							dot={false}
							activeDot={{
								r: 4,
								fill: CHART_COLORS[i % CHART_COLORS.length],
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
							color={CHART_COLORS[i % CHART_COLORS.length]}
							className="w-3.5 h-3.5"
						/>
						<span className="text-caption text-text-secondary">
							{getEventLabel(ev.event)}
						</span>
					</div>
				))}
			</div>

			<p className="text-caption text-text-tertiary">
				기준일(첫날) 대비 상대 변화율(%)로 정규화되어 표시됩니다.
			</p>
		</div>
	);
};

export default EventComparisonChart;
