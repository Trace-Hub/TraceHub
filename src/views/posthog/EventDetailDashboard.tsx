"use client"

import type { ReactElement } from "react"
import { useState } from "react"
import { useEventDetail } from "@/entities/event/api/getEventDetail"
import { useEventPages } from "@/entities/event/api/getEventPages"
import { useEventProperty } from "@/entities/event/api/getEventProperty"
import { usePageEventDistribution } from "@/entities/event/api/getPageEventDistribution"
import { EVENT_TAB_TO_PERIOD } from "@/entities/event/model/eventStats"
import type { EventPropertyType } from "@/entities/event/model/eventStats"
import { calcChangeRate } from "@/entities/event/model/eventStatsUtils"
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
	const [selectedPathname, setSelectedPathname] = useState("")

	const period = EVENT_TAB_TO_PERIOD[activePeriod]

	const handlePeriodChange = (next: TabPeriod) => {
		setActivePeriod(next)
		// 기간이 바뀌면 페이지 목록이 새로 패칭되므로 선택 상태를 초기화
		setSelectedPathname("")
	}

	const { data: detailData, isLoading: detailLoading } = useEventDetail(event, period)
	const {
		data: propertyData,
		isLoading: propertyLoading,
		isError: propertyError,
	} = useEventProperty(event, activeProperty, period)
	const { data: pagesData, isLoading: pagesLoading } = useEventPages(event, period)
	const { data: pageEventsData, isLoading: pageEventsLoading } =
		usePageEventDistribution(selectedPathname, period)

	const changeRate = detailData
		? calcChangeRate(detailData.metrics.totalCount, detailData.metrics.previousTotal)
		: 0

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
				onPeriodChange={handlePeriodChange}
			/>
			<EventDetailRelatedEventsSection
				pages={pagesData?.pages ?? []}
				pageEvents={pageEventsData?.events ?? []}
				selectedPathname={selectedPathname}
				onPathnameChange={setSelectedPathname}
				isLoading={pagesLoading || pageEventsLoading}
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
