"use client"

import type { ReactElement } from "react"
import type { EventDetailMetrics } from "@/entities/event/model/eventStats"
import { calcChangeRate } from "@/entities/event/model/eventStatsUtils"
import { cn } from "@/shared/lib/utils"
import MetricCard from "@/shared/ui/MetricCard"

interface EventDetailMetricsSectionProps {
	metrics: EventDetailMetrics | undefined
	changeRate: number
	className?: string
}

const EventDetailMetricsSection = ({
	metrics,
	changeRate,
	className,
}: EventDetailMetricsSectionProps): ReactElement => {
	// "유저당 평균" 은 서버 응답에 없는 파생값 — 클라이언트에서 계산
	const currentAvgPerUser =
		metrics && metrics.uniqueUsers > 0 ? metrics.totalCount / metrics.uniqueUsers : 0
	const prevAvgPerUser =
		metrics && metrics.previousUniqueUsers > 0
			? metrics.previousTotal / metrics.previousUniqueUsers
			: 0

	const cards: {
		label: string
		value: number | undefined
		format: (v: number) => string
		changeRate?: number
		previousValue?: number
		previousFormat?: (v: number) => string
	}[] = [
		{
			label: "총 발생 횟수",
			value: metrics?.totalCount,
			format: (v) => `${Math.round(v).toLocaleString()}회`,
			changeRate: metrics ? changeRate : undefined,
			previousValue: metrics?.previousTotal,
			previousFormat: (v) => `이전 ${Math.round(v).toLocaleString()}회`,
		},
		{
			label: "고유 유저 수",
			value: metrics?.uniqueUsers,
			format: (v) => `${Math.round(v).toLocaleString()}명`,
			changeRate: metrics
				? calcChangeRate(metrics.uniqueUsers, metrics.previousUniqueUsers)
				: undefined,
			previousValue: metrics?.previousUniqueUsers,
			previousFormat: (v) => `이전 ${Math.round(v).toLocaleString()}명`,
		},
		{
			label: "세션 수",
			value: metrics?.sessionCount,
			format: (v) => `${Math.round(v).toLocaleString()}회`,
			changeRate: metrics
				? calcChangeRate(metrics.sessionCount, metrics.previousSessionCount)
				: undefined,
			previousValue: metrics?.previousSessionCount,
			previousFormat: (v) => `이전 ${Math.round(v).toLocaleString()}회`,
		},
		{
			label: "유저당 평균",
			value: metrics ? currentAvgPerUser : undefined,
			format: (v) => `${v.toFixed(1)}회`,
			// 소수점 정밀도 손실 방지를 위해 ×10 정수로 변환 후 변화율 계산
			changeRate: metrics
				? calcChangeRate(
						Math.round(currentAvgPerUser * 10),
						Math.round(prevAvgPerUser * 10),
					)
				: undefined,
			previousValue: metrics ? prevAvgPerUser : undefined,
			previousFormat: (v) => `이전 ${v.toFixed(1)}회`,
		},
	]

	return (
		<section className={cn("grid grid-cols-2 gap-3 md:grid-cols-4", className)}>
			{cards.map((card) => (
				<MetricCard key={card.label} {...card} />
			))}
		</section>
	)
}

export default EventDetailMetricsSection
