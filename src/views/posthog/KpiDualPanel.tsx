"use client";

import { useId } from "react";
import type { ReactElement } from "react";
import { Area, AreaChart, XAxis } from "recharts";
import type {
	EventKpiPeriod,
	EventKpiResponse,
} from "@/entities/event/model/eventStats";
import { calcChangeRate } from "@/entities/event/model/eventStatsUtils";
import { cn } from "@/shared/lib/utils";
import AnimatedNumber from "@/shared/ui/AnimatedNumber";
import ChangeRateBadge from "@/shared/ui/ChangeRateBadge";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/shared/ui/chart";
import Skeleton from "@/shared/ui/skeleton";

// AnimatedNumber의 format prop은 애니메이션 도중 소수점 값을 받으므로 반올림 처리
const formatCount = (v: number): string => Math.round(v).toLocaleString();

// 오늘(24시간) 기준 X축 눈금 — 6시간 간격으로 표시
const TODAY_X_TICKS = ["0시", "6시", "12시", "18시", "23시"];

interface KpiSparklineProps {
	breakdown: KpiBreakdownPoint[];
	dataKey: "activeUsers" | "totalEvents";
	color: string;
	label: string;
}

const KpiSparkline = ({
	breakdown,
	dataKey,
	color,
	label,
}: KpiSparklineProps): ReactElement => {
	const uid = useId();
	const gradientId = `kpi-fill-${uid}-${dataKey}`;

	const chartData = breakdown.map((p) => ({
		label: p.label,
		value: p[dataKey],
	}));
	const config: ChartConfig = { value: { label, color } };
	const isHourly = chartData.length === 24;
	const xTicks = isHourly ? TODAY_X_TICKS : chartData.map((p) => p.label);

	return (
		<ChartContainer config={config} className="h-21 w-full">
			<AreaChart
				data={chartData}
				margin={{ top: 4, right: 8, bottom: 0, left: 8 }}
			>
				<defs>
					<linearGradient
						id={gradientId}
						x1="0"
						y1="0"
						x2="0"
						y2="1"
					>
						<stop
							offset="5%"
							stopColor="var(--color-value)"
							stopOpacity={0.3}
						/>
						<stop offset="95%" stopColor="var(--color-value)" stopOpacity={0} />
					</linearGradient>
				</defs>
				<XAxis
					dataKey="label"
					ticks={xTicks}
					tickLine={false}
					axisLine={false}
					tick={{ fontSize: 9, fill: "var(--color-text-tertiary)" }}
				/>
				<ChartTooltip
					content={
						<ChartTooltipContent className="bg-bg-card border-border-base shadow-md" />
					}
					isAnimationActive={false}
				/>
				<Area
					type="monotone"
					dataKey="value"
					stroke="var(--color-value)"
					fill={`url(#${gradientId})`}
					strokeWidth={1.5}
					dot={false}
					isAnimationActive
					animationDuration={800}
					animationEasing="ease-out"
				/>
			</AreaChart>
		</ChartContainer>
	);
};

interface KpiPanelProps {
	title: string;
	compareLabel: string;
	data: EventKpiPeriod;
	className?: string;
}

const KpiPanel = ({
	title,
	compareLabel,
	data,
	className,
}: KpiPanelProps): ReactElement => {
	const activeUsersRate = calcChangeRate(data.activeUsers, data.previousActiveUsers);
	const totalEventsRate = calcChangeRate(data.totalEvents, data.previousTotalEvents);

	return (
		<div
			className={cn(
				"flex flex-col gap-3 p-4 rounded-xl border border-border-subtle bg-bg-card",
				className,
			)}
		>
			<div className="flex items-center justify-between">
				<span className="text-body2 font-medium text-text-secondary">
					{title}
				</span>
				<span className="text-caption text-text-tertiary">
					{compareLabel} 대비
				</span>
			</div>
			<div className="grid grid-cols-2 gap-4">
				<div className="flex flex-col gap-2">
					<div className="flex flex-col gap-1">
						<span className="text-caption text-text-secondary">
							활성 사용자
						</span>
						<div className="flex items-baseline gap-2">
							<AnimatedNumber
								value={data.activeUsers}
								format={formatCount}
								className="text-display font-bold text-text-primary"
							/>
							<ChangeRateBadge value={activeUsersRate} />
						</div>
					</div>
					<KpiSparkline
						breakdown={data.breakdown}
						dataKey="activeUsers"
						color="var(--color-primary)"
						label="활성 사용자"
					/>
				</div>
				<div className="flex flex-col gap-2">
					<div className="flex flex-col gap-1">
						<span className="text-caption text-text-secondary">총 이벤트</span>
						<div className="flex items-baseline gap-2">
							<AnimatedNumber
								value={data.totalEvents}
								format={formatCount}
								className="text-display font-bold text-text-primary"
							/>
							<ChangeRateBadge value={totalEventsRate} />
						</div>
					</div>
					<KpiSparkline
						breakdown={data.breakdown}
						dataKey="totalEvents"
						color="var(--color-success)"
						label="총 이벤트"
					/>
				</div>
			</div>
		</div>
	);
};

interface KpiDualPanelProps {
	data: EventKpiResponse;
	className?: string;
}

const KpiPanelSkeleton = (): ReactElement => (
	<div className="flex flex-col gap-3 p-4 rounded-xl border border-border-subtle bg-bg-card">
		<div className="flex items-center justify-between">
			<Skeleton className="h-3.5 w-8 rounded" />
			<Skeleton className="h-3 w-14 rounded" />
		</div>
		<div className="grid grid-cols-2 gap-4">
			{([0, 1] as const).map((i) => (
				<div key={i} className="flex flex-col gap-2">
					<div className="flex flex-col gap-1">
						<Skeleton className="h-3 w-14 rounded" />
						<div className="flex items-baseline gap-2">
							<Skeleton className="h-7 w-16 rounded" />
							<Skeleton className="h-4 w-10 rounded-full" />
						</div>
					</div>
					<Skeleton className="h-21 w-full rounded" />
				</div>
			))}
		</div>
	</div>
);

const KpiDualPanelSkeleton = ({
	className,
}: {
	className?: string;
}): ReactElement => (
	<div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", className)}>
		<KpiPanelSkeleton />
		<KpiPanelSkeleton />
	</div>
);

const KpiDualPanel = ({ data, className }: KpiDualPanelProps): ReactElement => (
	<div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", className)}>
		<KpiPanel title="오늘" compareLabel="전날" data={data.today} />
		<KpiPanel title="최근 7일" compareLabel="전주" data={data.week} />
	</div>
);

export { KpiDualPanelSkeleton };
export default KpiDualPanel;
