"use client";

import type { ReactElement } from "react";
import type { EventTrendPoint } from "@/entities/event/model/eventStats";
import { cn } from "@/shared/lib/utils";
import PeriodSelector, {
	type Period as TabPeriod,
} from "@/shared/ui/PeriodSelector";
import EventDetailTrendChart from "@/widgets/posthog/eventDetail/EventDetailTrendChart";
import EventDetailTrendSectionSkeleton from "@/widgets/posthog/eventDetail/EventDetailTrendSectionSkeleton";

interface EventDetailTrendSectionProps {
	trend: EventTrendPoint[] | undefined;
	isLoading: boolean;
	period: TabPeriod;
	onPeriodChange: (period: TabPeriod) => void;
	className?: string;
}

const EventDetailTrendSection = ({
	trend,
	isLoading,
	period,
	onPeriodChange,
	className,
}: EventDetailTrendSectionProps): ReactElement => {
	return (
		<section className={cn("flex flex-col gap-3", className)}>
			<div className="flex items-center justify-between">
				<h3 className="text-body2 font-medium text-text-primary">
					시간대별 발생 현황
				</h3>
				<PeriodSelector value={period} onChange={onPeriodChange} />
			</div>
			<div className="p-4 rounded-xl border border-border-base bg-bg-base">
				{isLoading && <EventDetailTrendSectionSkeleton />}
				{!isLoading && trend && (
					<EventDetailTrendChart trend={trend} period={period} />
				)}
			</div>
		</section>
	);
};

export default EventDetailTrendSection;
