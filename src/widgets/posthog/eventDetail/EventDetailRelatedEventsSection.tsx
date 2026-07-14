"use client";

import type { ReactElement } from "react";
import useApiErrorToast from "@/shared/hooks/useApiErrorToast";
import type {
	EventPageStat,
	PageEventItem,
} from "@/entities/event/model/eventStats";
import { CHART_COLOR_PALETTE } from "@/shared/config/chartColors";
import { getEventLabel } from "@/shared/config/eventLabel";
import { cn } from "@/shared/lib/utils";
import Dropdown from "@/shared/ui/Dropdown";
import EmptyState from "@/shared/ui/EmptyState";
import PercentageBarChart, {
	type PercentageBarChartItem,
} from "@/shared/ui/PercentageBarChart";
import EventDetailRelatedEventsSectionSkeleton from "@/widgets/posthog/eventDetail/EventDetailRelatedEventsSectionSkeleton";
import EventRelatedDonutChart from "@/widgets/posthog/eventDetail/EventRelatedDonutChart";

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

	useApiErrorToast(isError, "페이지별 이벤트 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");

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
	const pageOptions = [
		{ value: "", label: "전체" },
		...pages.map((p) => ({ value: p.pathname, label: p.pathname })),
	];

	return (
		<section className={cn("flex flex-col gap-3", className)}>
			<div className="flex items-center justify-between">
				<h3 className="text-body2 font-medium text-text-primary">
					페이지별 발생 현황
				</h3>
				{!isLoading && !isPagesEmpty && (
					<Dropdown
						value={selectedPathname}
						onChange={onPathnameChange}
						options={pageOptions}
						ariaLabel="페이지 선택"
					/>
				)}
			</div>

			{isLoading && <EventDetailRelatedEventsSectionSkeleton />}
			{!isLoading && isError && (
				<div className="flex min-h-48 items-center justify-center md:min-h-60">
					<EmptyState message="데이터를 불러오지 못했습니다" iconColor="var(--color-error)" />
				</div>
			)}
			{!isLoading && !isError && isChartEmpty && (
				<div className="flex min-h-48 items-center justify-center md:min-h-60">
					<EmptyState message="이벤트 데이터가 없습니다" />
				</div>
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
