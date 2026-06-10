"use client";

import { type ReactElement, useState } from "react";
import {
	CartesianGrid,
	Line,
	LineChart,
	ReferenceLine,
	XAxis,
	YAxis,
} from "recharts";
import type { EventStats } from "@/entities/event/model/eventStats";
import {
	buildCountData,
	buildNormalizedData,
} from "@/views/posthog/model/eventChartUtils";
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

type ChartMode = "count" | "normalized";

interface EventComparisonChartProps {
	events: EventStats[];
	className?: string;
}

const CHART_MODE_LABELS: Record<ChartMode, string> = {
	count: "횟수",
	normalized: "정규화",
};

const EventComparisonChart = ({
	events,
	className,
}: EventComparisonChartProps): ReactElement => {
	const [mode, setMode] = useState<ChartMode>("count");

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

	const chartData =
		mode === "count"
			? buildCountData(filteredEvents)
			: buildNormalizedData(filteredEvents);

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
			<div className="flex justify-end">
				<div role="tablist" aria-label="차트 표시 방식" className="inline-flex items-center gap-1">
					{(["count", "normalized"] as ChartMode[]).map((m) => (
						<button
							key={m}
							role="tab"
							type="button"
							aria-selected={mode === m}
							onClick={() => setMode(m)}
							className={cn(
								"px-3 py-1 rounded-md",
								"text-caption font-medium",
								"transition-[background-color,color] duration-150 ease",
								mode === m
									? "bg-primary text-white"
									: "text-text-secondary hover:text-text-primary",
							)}
						>
							{CHART_MODE_LABELS[m]}
						</button>
					))}
				</div>
			</div>

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
							mode === "normalized"
								? `${v}%`
								: v >= 1000
									? `${(v / 1000).toFixed(1)}k`
									: `${v}`
						}
					/>
					{mode === "normalized" && (
						<ReferenceLine
							y={0}
							stroke="var(--color-border-base)"
							strokeWidth={1}
						/>
					)}
					<ChartTooltip
						cursor={{ stroke: "var(--color-border-base)", strokeWidth: 1 }}
						content={<ChartTooltipContent indicator="line" />}
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
				{mode === "count"
					? "이벤트 유형별 발생 횟수 추이를 비교합니다."
					: "첫 이벤트 발생일 기준 상대 변화율(%)로 정규화되어 표시됩니다."}
			</p>
		</div>
	);
};

export default EventComparisonChart;
