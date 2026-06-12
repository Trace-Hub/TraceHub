"use client";

import type { ReactElement } from "react";
import type {
	EventPageStat,
	PageEventItem,
} from "@/entities/event/model/eventStats";
import { CHART_COLOR_PALETTE } from "@/shared/config/chartColors";
import { getEventLabel } from "@/shared/config/eventLabel";
import { cn } from "@/shared/lib/utils";
import PercentageBarChart, {
	type PercentageBarChartItem,
} from "@/shared/ui/PercentageBarChart";
import EventRelatedDonutChart from "@/views/posthog/EventRelatedDonutChart";

interface EventDetailRelatedEventsSectionProps {
	pages: EventPageStat[];
	pageEvents: PageEventItem[];
	selectedPathname: string;
	onPathnameChange: (pathname: string) => void;
	isLoading: boolean;
	isError: boolean;
	className?: string;
}

const EventDetailRelatedEventsSection = ({
	pages,
	pageEvents,
	selectedPathname,
	onPathnameChange,
	isLoading,
	isError,
	className,
}: EventDetailRelatedEventsSectionProps): ReactElement => {
	const isPagesEmpty = pages.length === 0;

	const donutValues = pageEvents.map((e) => ({
		value: getEventLabel(e.event),
		count: e.count,
	}));
	const barValues: PercentageBarChartItem[] = pageEvents.map((e) => ({
		value: getEventLabel(e.event),
		count: e.count,
		percentage: e.percentage,
	}));
	const isChartEmpty = pageEvents.length === 0;

	return (
		<section className={cn("flex flex-col gap-3", className)}>
			<div className="flex items-center justify-between">
				<h3 className="text-body2 font-medium text-text-primary">
					페이지별 발생 현황
				</h3>
				{!isLoading && !isPagesEmpty && (
					<select
						value={selectedPathname}
						onChange={(e) => onPathnameChange(e.target.value)}
						aria-label="페이지 선택"
						className="text-caption text-text-secondary bg-bg-base border border-border-base rounded-md px-2 py-1 focus:outline-none focus:border-border-focus"
					>
						<option value="">전체</option>
						{pages.map((p) => (
							<option key={p.pathname} value={p.pathname}>
								{p.pathname}
							</option>
						))}
					</select>
				)}
			</div>

			{isLoading && (
				<p className="text-caption text-text-tertiary py-8 text-center">
					로딩 중...
				</p>
			)}
			{!isLoading && isError && (
				<p className="text-body2 text-text-tertiary py-8 text-center">
					잠시 후 다시 시도해주세요
				</p>
			)}
			{!isLoading && !isError && isChartEmpty && (
				<p className="text-body2 text-text-tertiary py-8 text-center">
					이벤트 데이터가 없습니다
				</p>
			)}
			{!isLoading && !isError && !isChartEmpty && (
				<div className="flex flex-col gap-3 md:flex-row">
					<div className="flex flex-col gap-2 flex-1 p-4 rounded-xl border border-border-base bg-bg-base">
						<span className="text-caption text-text-tertiary">
							이벤트 발생 비중
						</span>
						<EventRelatedDonutChart
							data={donutValues}
							colors={CHART_COLOR_PALETTE}
						/>
					</div>
					<div className="flex flex-col gap-2 flex-1 p-4 rounded-xl border border-border-base bg-bg-base">
						<span className="text-caption text-text-tertiary">
							이벤트 발생 횟수
						</span>
						<PercentageBarChart
							values={barValues}
							metric="count"
							colors={CHART_COLOR_PALETTE}
						/>
					</div>
				</div>
			)}
		</section>
	);
};

export default EventDetailRelatedEventsSection;
