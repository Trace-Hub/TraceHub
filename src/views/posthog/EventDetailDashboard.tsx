"use client"

import type { ReactElement } from "react"
import { useState } from "react"
import { useEventDetail } from "@/entities/event/api/getEventDetail"
import { useEventProperty } from "@/entities/event/api/getEventProperty"
import { useRelatedEvents } from "@/entities/event/api/getRelatedEvents"
import { EVENT_TAB_TO_PERIOD } from "@/entities/event/model/eventStats"
import type { EventPropertyType } from "@/entities/event/model/eventStats"
import {
	calcChangeRate,
	sortRelatedEventsByLabel,
} from "@/entities/event/model/eventStatsUtils"
import { cn } from "@/shared/lib/utils"
import { type Period as TabPeriod } from "@/shared/ui/PeriodSelector"
import EventDetailInsightSection from "@/views/posthog/EventDetailInsightSection"
import EventDetailMetricsSection from "@/views/posthog/EventDetailMetricsSection"
import EventDetailPropertySection from "@/views/posthog/EventDetailPropertySection"
import EventDetailRelatedEventsSection from "@/views/posthog/EventDetailRelatedEventsSection"
import EventDetailTrendSection from "@/views/posthog/EventDetailTrendSection"

interface EventDetailDashboardProps {
	event: string
	className?: string
}

const EventDetailDashboard = ({
	event,
	className,
}: EventDetailDashboardProps): ReactElement => {
	const [activePeriod, setActivePeriod] = useState<TabPeriod>("오늘")
	const [activeProperty, setActiveProperty] = useState<EventPropertyType>("browser")

	const period = EVENT_TAB_TO_PERIOD[activePeriod]

	const { data: detailData, isLoading: detailLoading } = useEventDetail(event, period)
	const {
		data: propertyData,
		isLoading: propertyLoading,
		isError: propertyError,
	} = useEventProperty(event, activeProperty, period)
	const { data: relatedData, isLoading: relatedLoading } = useRelatedEvents(event, period)

	const changeRate = detailData
		? calcChangeRate(detailData.metrics.totalCount, detailData.metrics.previousTotal)
		: 0

	// 도넛은 세션 비중(관계성), 막대는 절대 발생 횟수 — 서로 다른 인사이트라 데이터를 분리
	const relatedSorted = sortRelatedEventsByLabel(relatedData?.related ?? [])
	const relatedDonutValues = relatedSorted.map((r) => ({
		value: r.label,
		count: r.sessionCount,
		percentage: r.percentage,
	}))
	const relatedBarValues = relatedSorted.map((r) => ({
		value: r.label,
		count: r.occurrenceCount,
		percentage: r.percentage,
	}))

	return (
		<div className={cn("flex flex-col gap-6", className)}>
			<EventDetailMetricsSection
				metrics={detailData?.metrics}
				changeRate={changeRate}
			/>
			<EventDetailInsightSection
				event={event}
				totalCount={detailData?.metrics.totalCount ?? 0}
				changeRate={changeRate}
				period={period}
			/>
			<EventDetailTrendSection
				trend={detailData?.trend}
				isLoading={detailLoading}
				period={activePeriod}
				onPeriodChange={setActivePeriod}
			/>
			<EventDetailRelatedEventsSection
				donutValues={relatedDonutValues}
				barValues={relatedBarValues}
				isLoading={relatedLoading}
			/>
			<EventDetailPropertySection
				activeProperty={activeProperty}
				onPropertyChange={setActiveProperty}
				values={propertyData?.values}
				isLoading={propertyLoading}
				isError={propertyError}
			/>
		</div>
	)
}

export default EventDetailDashboard
