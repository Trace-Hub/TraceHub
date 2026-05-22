import type { ReactNode } from "react";
import type { Period } from "@/entities/event/model/eventStats";
import { calcChangeRate } from "@/entities/event/model/eventStatsUtils";
import { getEventLabel } from "@/shared/config/eventLabel";
import { cn } from "@/shared/lib/utils";
import ChangeRateBadge from "@/shared/ui/ChangeRateBadge";
import StatsRow from "@/shared/ui/StatsRow";
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
}: EventStatCardProps) => {
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
			<div className="flex items-center justify-between">
				<h3 className="text-h1 font-bold text-text-primary">{label}</h3>
				<ChangeRateBadge value={changeRate} />
			</div>
			<StatsRow
				variant="event"
				count={currentTotal}
				previous={previousTotal}
				peakTime={peakLabel}
			/>
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
