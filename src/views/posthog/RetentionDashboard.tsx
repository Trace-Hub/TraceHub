"use client"

import type { ReactElement } from "react"
import { useRetention } from "@/entities/event/api/getRetention"
import { formatWeekOfMonth } from "@/entities/event/model/retention"
import useApiErrorToast from "@/shared/hooks/useApiErrorToast"
import AnimatedNumber from "@/shared/ui/AnimatedNumber"
import EmptyState from "@/shared/ui/EmptyState"
import MetricCard from "@/shared/ui/MetricCard"
import RetentionComboChart from "@/widgets/posthog/RetentionComboChart"
import RetentionDashboardSkeleton from "@/widgets/posthog/RetentionDashboardSkeleton"
import RetentionHalfPieChart from "@/widgets/posthog/RetentionHalfPieChart"
import RetentionHeatmap from "@/widgets/posthog/RetentionHeatmap"

const formatPct = (v: number): string => `${v.toFixed(1)}%`
const formatCount = (v: number): string => Math.round(v).toLocaleString()

const RetentionDashboard = (): ReactElement => {
	const { data, isLoading, isError } = useRetention()

	useApiErrorToast(
		isError,
		"리텐션 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
	)

	if (isLoading) return <RetentionDashboardSkeleton />

	if (isError || !data) {
		return (
			<div className="flex flex-1 items-center justify-center">
				<EmptyState
					message="데이터를 불러오지 못했습니다"
					iconColor="var(--color-error)"
				/>
			</div>
		)
	}

	const { cohorts, kpi } = data

	return (
		<div className="flex flex-col gap-6 p-6 h-full">
			{/* 페이지 헤더 */}
			<div>
				<h1 className="text-h1 font-bold text-text-primary">리텐션</h1>
				<p className="text-body2 text-text-secondary mt-1">
					같은 주에 처음 방문한 사용자 그룹(코호트)이 이후 주에도 재방문하는 비율을 추적합니다.
				</p>
			</div>

			{/* 상단: KPI 카드 4개 */}
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
				<MetricCard
					label="평균 Week 1 리텐션율"
					value={kpi.avgWeek1Retention}
					format={formatPct}
				/>
				{/*
				 * 최고 리텐션 코호트는 잔존율(숫자) + 주차(문자열)를 함께 표시해야 해서
				 * MetricCard의 previousFormat(number→string)으로 표현할 수 없어 커스텀으로 작성
				 */}
				<div className="flex flex-col gap-1 p-4 rounded-xl border border-border-subtle bg-bg-card">
					<span className="text-caption text-text-tertiary">
						최고 리텐션 코호트
					</span>
					<span className="text-h1 font-bold text-text-primary">
						{kpi.bestCohort ? (
							<AnimatedNumber
								value={kpi.bestCohort.rate}
								format={formatPct}
							/>
						) : (
							"-"
						)}
					</span>
					<span className="text-caption text-text-tertiary">
						{kpi.bestCohort ? formatWeekOfMonth(kpi.bestCohort.weekStart) : "-"}
					</span>
				</div>
				<MetricCard
					label="전체 추적 사용자"
					value={kpi.totalTrackedUsers}
					format={formatCount}
				/>
				<MetricCard
					label="이번 주 신규 코호트"
					value={kpi.currentWeekNewUsers}
					format={formatCount}
				/>
			</div>

			{/* 중단: 차트 2개 */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="flex flex-col gap-3 p-4 rounded-xl border border-border-subtle bg-bg-card">
					<span className="text-body2 font-medium text-text-secondary">
						주차별 신규 사용자 & Week 1 잔존율
					</span>
					<RetentionComboChart cohorts={cohorts} />
				</div>
				<div className="flex flex-col gap-3 p-4 rounded-xl border border-border-subtle bg-bg-card">
					<span className="text-body2 font-medium text-text-secondary">
						전체 리텐션 비율
					</span>
					<RetentionHalfPieChart
						retainedUsersCount={kpi.retainedUsersCount}
						totalTrackedUsers={kpi.totalTrackedUsers}
					/>
				</div>
			</div>

			{/* 하단: 코호트 히트맵 */}
			<div className="flex flex-col gap-3">
				<span className="text-body2 font-medium text-text-secondary">
					코호트 히트맵
				</span>
				<RetentionHeatmap cohorts={cohorts} />
			</div>
		</div>
	)
}

export default RetentionDashboard
