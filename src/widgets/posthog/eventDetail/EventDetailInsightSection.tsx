"use client"

import type { ReactElement } from "react"
import {
	getActionText,
	getComparisonText,
	getFactText,
} from "@/entities/event/model/eventInsightUtils"
import type { Period } from "@/entities/event/model/eventStats"
import { getEventLabel } from "@/shared/config/eventLabel"
import { buildPostHogEventUrl } from "@/shared/lib/posthog"
import { cn } from "@/shared/lib/utils"
import InsightLabel from "@/shared/ui/InsightLabel"
import LinkIcon from "@/shared/ui/icons/LinkIcon"

interface EventDetailInsightSectionProps {
	event: string
	totalCount: number
	changeRate: number
	period: Period
	className?: string
}

const EventDetailInsightSection = ({
	event,
	totalCount,
	changeRate,
	period,
	className,
}: EventDetailInsightSectionProps): ReactElement => {
	const label = getEventLabel(event)
	const posthogUrl = buildPostHogEventUrl(event, period)

	return (
		<section className={cn("flex flex-col gap-2", className)}>
			<div className="flex items-center justify-between">
				<h3 className="text-body2 font-medium text-text-primary">인사이트</h3>
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
			<InsightLabel variant="fact" text={getFactText(label, totalCount)} />
			<InsightLabel variant="comparison" text={getComparisonText(changeRate)} />
			<InsightLabel variant="action" text={getActionText(event, changeRate)} />
		</section>
	)
}

export default EventDetailInsightSection
