"use client"

import type { ReactElement } from "react"
import { CHART_COLOR_PALETTE } from "@/shared/config/chartColors"
import { cn } from "@/shared/lib/utils"
import PercentageBarChart, {
	type PercentageBarChartItem,
} from "@/shared/ui/PercentageBarChart"
import EventRelatedDonutChart from "@/views/posthog/EventRelatedDonutChart"

interface EventDetailRelatedEventsSectionProps {
	// 도넛용: count = sessionCount (함께 발생한 세션 수)
	donutValues: PercentageBarChartItem[]
	// 막대용: count = occurrenceCount (연관 이벤트의 절대 발생 횟수)
	barValues: PercentageBarChartItem[]
	isLoading: boolean
	className?: string
}

const EventDetailRelatedEventsSection = ({
	donutValues,
	barValues,
	isLoading,
	className,
}: EventDetailRelatedEventsSectionProps): ReactElement => {
	const isEmpty = donutValues.length === 0

	return (
		<section className={cn("flex flex-col gap-3", className)}>
			<h3 className="text-body2 font-medium text-text-primary">연관 이벤트</h3>

			{isLoading && (
				<p className="text-caption text-text-tertiary py-8 text-center">로딩 중...</p>
			)}
			{!isLoading && isEmpty && (
				<p className="text-body2 text-text-tertiary py-8 text-center">
					세션 데이터가 없습니다
				</p>
			)}
			{!isLoading && !isEmpty && (
				<div className="flex flex-col gap-3 md:flex-row">
					<div className="flex flex-col gap-2 flex-1 p-4 rounded-xl border border-border-base bg-bg-base">
						<span className="text-caption text-text-tertiary">세션 비중 분포</span>
						<EventRelatedDonutChart
							data={donutValues.map((v) => ({ value: v.value, count: v.count }))}
							colors={CHART_COLOR_PALETTE}
						/>
					</div>
					<div className="flex flex-col gap-2 flex-1 p-4 rounded-xl border border-border-base bg-bg-base">
						<span className="text-caption text-text-tertiary">이벤트 발생 횟수</span>
						<PercentageBarChart
							values={barValues}
							metric="count"
							colors={CHART_COLOR_PALETTE}
						/>
					</div>
				</div>
			)}
		</section>
	)
}

export default EventDetailRelatedEventsSection