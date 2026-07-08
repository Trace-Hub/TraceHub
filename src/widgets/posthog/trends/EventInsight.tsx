"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ReactElement } from "react";
import { useState } from "react";
import {
	getActionText,
	getComparisonText,
	getFactText,
} from "@/entities/event/model/eventInsightUtils";
import type { Period } from "@/entities/event/model/eventStats";
import { getEventLabel } from "@/shared/config/eventLabel";
import { buildPostHogEventUrl } from "@/shared/lib/posthog";
import { cn } from "@/shared/lib/utils";
import InsightLabel from "@/shared/ui/InsightLabel";
import DropIcon from "@/shared/ui/icons/DropIcon";
import LiftIcon from "@/shared/ui/icons/LiftIcon";
import LinkIcon from "@/shared/ui/icons/LinkIcon";

interface EventInsightProps {
	event: string;
	currentTotal: number;
	changeRate: number;
	period: Period;
	className?: string;
}

const EventInsight = ({
	event,
	currentTotal,
	changeRate,
	period,
	className,
}: EventInsightProps): ReactElement => {
	const [isOpen, setIsOpen] = useState(false);

	const label = getEventLabel(event);
	const posthogUrl = buildPostHogEventUrl(event, period);

	const factText = getFactText(label, currentTotal);
	const comparisonText = getComparisonText(changeRate);
	const actionText = getActionText(event, changeRate);

	return (
		<div className={cn("flex flex-col gap-2", className)}>
			{!isOpen && (
				<div className="flex items-center justify-between">
					<button
						type="button"
						aria-expanded={false}
						onClick={() => setIsOpen(true)}
						className="flex items-center gap-1 text-body2 text-text-secondary hover:text-text-primary transition-colors duration-150"
					>
						<DropIcon className="w-4 h-4" />
						해석 보기
					</button>
					<a
						href={posthogUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-1 text-body2 text-primary hover:text-primary-hover transition-colors duration-150"
					>
						PostHog에서 보기
						<LinkIcon className="w-3.5 h-3.5" />
					</a>
				</div>
			)}

			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						transition={{ duration: 0.2, ease: "easeOut" }}
						className="flex flex-col gap-2 overflow-hidden"
					>
						<InsightLabel variant="fact" text={factText} />
						<InsightLabel variant="comparison" text={comparisonText} />
						<InsightLabel variant="action" text={actionText} />
						<div className="flex items-center justify-between">
							<button
								type="button"
								aria-expanded={true}
								onClick={() => setIsOpen(false)}
								className="flex items-center gap-1 text-body2 text-text-secondary hover:text-text-primary transition-colors duration-150"
							>
								<LiftIcon className="w-4 h-4" />
								해석 숨기기
							</button>
							<a
								href={posthogUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-1 text-body2 text-primary hover:text-primary-hover transition-colors duration-150"
							>
								PostHog에서 보기
								<LinkIcon className="w-3.5 h-3.5" />
							</a>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export default EventInsight;
