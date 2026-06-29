import Link from "next/link";
import type { ReactElement, ReactNode } from "react";
import type { Period } from "@/entities/event/model/eventStats";
import { calcChangeRate } from "@/entities/event/model/eventStatsUtils";
import { getEventLabel } from "@/shared/config/eventLabel";
import { cn } from "@/shared/lib/utils";
import ChangeRateBadge from "@/shared/ui/ChangeRateBadge";
import EventInsight from "@/views/posthog/EventInsight";

interface EventStatCardProps {
	event: string;
	currentTotal: number;
	previousTotal: number;
	peakLabel: string;
	period: Period;
	children: ReactNode;
	className?: string;
}

const EventStatCard = ({
	event,
	currentTotal,
	previousTotal,
	peakLabel,
	period,
	children,
	className,
}: EventStatCardProps): ReactElement => {
	const label = getEventLabel(event);
	const changeRate = calcChangeRate(currentTotal, previousTotal);

	return (
		<div
			className={cn(
				"flex flex-col gap-4",
				"p-4 rounded-xl border border-border-subtle bg-bg-card",
				className,
			)}
		>
			<Link
				href={`/dashboard/events/${encodeURIComponent(event)}?period=${period}`}
				className="flex flex-col gap-4 -mx-4 -mt-4 px-4 pt-4 pb-0 rounded-t-xl hover:bg-bg-hover transition-colors duration-150"
			>
				<div className="flex items-center justify-between">
					<span className="text-h1 font-bold text-text-primary">{label}</span>
					<ChangeRateBadge value={changeRate} />
				</div>
				<p className="text-caption text-text-secondary">
					발생{" "}
					<span className="font-medium text-text-primary">{currentTotal.toLocaleString()}회</span>
					{" · "}
					이전{" "}
					<span className="font-medium text-text-primary">{previousTotal.toLocaleString()}회</span>
					{" · "}
					피크{" "}
					<span className="font-medium text-text-primary">{peakLabel}</span>
				</p>
			</Link>
			{children}
			<EventInsight
				event={event}
				currentTotal={currentTotal}
				changeRate={changeRate}
				period={period}
			/>
		</div>
	);
};

export default EventStatCard;
