"use client"

import type { ReactElement } from "react"
import { useState } from "react"
import { EVENT_TAB_TO_PERIOD } from "@/entities/event/model/eventStats"
import { usePaths } from "@/entities/event/api/getPaths"
import { usePathsKpi } from "@/entities/event/api/getPathsKpi"
import type { PathStepCount } from "@/entities/event/model/paths"
import useApiErrorToast from "@/shared/hooks/useApiErrorToast"
import { formatCount } from "@/shared/lib/formatters"
import AnimatedNumber from "@/shared/ui/AnimatedNumber"
import EmptyState from "@/shared/ui/EmptyState"
import type { Period as PeriodTabValue } from "@/shared/ui/PeriodTab"
import PeriodTab from "@/shared/ui/PeriodTab"
import Skeleton from "@/shared/ui/skeleton"
import PathDropdown from "@/shared/ui/PathDropdown"
import PathStepDropdown from "@/views/posthog/paths/PathStepDropdown"
import PathsDashboardSkeleton from "@/widgets/posthog/paths/PathsDashboardSkeleton"
import PathsSankeyChart from "@/widgets/posthog/paths/PathsSankeyChart"

const DEFAULT_STEP_COUNT: PathStepCount = 3
// "all" = 전체 경로(시작점 필터 없음) — 사용자별 실제 첫 방문 페이지가 Step 0이 된다
const DEFAULT_START_PATH = "all"

const PathsDashboard = (): ReactElement => {
	const [periodTab, setPeriodTab] = useState<PeriodTabValue>("7일")
	const [start, setStart] = useState<string>(DEFAULT_START_PATH)
	const [stepCount, setStepCount] = useState<PathStepCount>(DEFAULT_STEP_COUNT)
	const period = EVENT_TAB_TO_PERIOD[periodTab]

	const { data: kpi, isLoading: isKpiLoading, isError: isKpiError } = usePathsKpi(period)
	const {
		data: flows,
		isLoading: isFlowsLoading,
		isError: isFlowsError,
	} = usePaths(start, period, stepCount)

	// "전체 경로"와 특정 경로 필터는 Step 0의 의미 자체가 다르다 — 전체 경로는 "세션이 실제로
	// 시작된 페이지", 특정 경로 필터는 "세션 안에서 그 경로를 처음 만난 지점"(세션의 첫 페이지가
	// 아니어도 됨)이라 같은 문구로 뭉뚱그리면 오해하기 쉽다(예: 어떤 페이지를 필터링했을 때는
	// 분기가 잘 보이는데 전체 경로에서는 그 페이지가 안 보이는 경우)
	const stepDescription =
		start === "all"
			? "Step 0은 세션이 실제로 시작된 페이지"
			: `Step 0은 세션 중 ${start}를 처음 만난 지점(세션의 첫 페이지가 아니어도 됨)`

	useApiErrorToast(
		isKpiError,
		"경로 KPI 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
	)
	useApiErrorToast(
		isFlowsError,
		"경로 흐름 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
	)

	if (isKpiLoading) return <PathsDashboardSkeleton />

	return (
		<div className="flex flex-col gap-6 p-6 h-full">
			{/* 페이지 헤더 */}
			<div className="flex items-start justify-between gap-4">
				<div>
					<h1 className="text-h1 font-bold text-text-primary">유저 경로</h1>
					<p className="text-body2 text-text-secondary mt-1">
						사용자가 실제로 어떤 페이지에서 어떤 페이지로 이동하는지 분석합니다.
					</p>
				</div>
				<PeriodTab value={periodTab} onChange={setPeriodTab} className="shrink-0" />
			</div>

			{/* 상단: KPI 카드 2개 — 선택한 기간 전체 집계, 시작점 선택과는 무관 */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="flex flex-col gap-1 p-4 rounded-xl border border-border-subtle bg-bg-card">
					<span className="text-caption text-text-tertiary">상위 시작 경로</span>
					<span className="text-h1 font-bold text-text-primary truncate">
						{kpi?.topEntryPath?.path ?? "-"}
					</span>
					<span className="text-caption text-text-tertiary">
						{kpi?.topEntryPath ? (
							<>
								<AnimatedNumber value={kpi.topEntryPath.count} format={formatCount} />
								개 세션
							</>
						) : (
							"-"
						)}
					</span>
				</div>
				<div className="flex flex-col gap-1 p-4 rounded-xl border border-border-subtle bg-bg-card">
					<span className="text-caption text-text-tertiary">상위 이탈 경로</span>
					<span className="text-h1 font-bold text-text-primary truncate">
						{kpi?.topExitPath?.path ?? "-"}
					</span>
					<span className="text-caption text-text-tertiary">
						{kpi?.topExitPath ? (
							<>
								<AnimatedNumber value={kpi.topExitPath.count} format={formatCount} />
								개 세션
							</>
						) : (
							"-"
						)}
					</span>
				</div>
			</div>

			{/* 하단: 시작점 선택 + 단계 수 선택 + Sankey */}
			<div className="flex flex-col gap-3">
				<div className="flex items-center justify-between gap-4 flex-wrap">
					<div>
						<span className="text-body2 font-medium text-text-secondary block">경로 흐름</span>
						<span className="text-caption text-text-tertiary">
							{stepDescription} · 각 단계 상위 4개 경로만 노출, 나머지는 &quot;기타&quot;로 묶음
						</span>
					</div>
					<div className="flex items-center gap-2 shrink-0">
						<PathDropdown value={start} onChange={setStart} />
						<PathStepDropdown value={stepCount} onChange={setStepCount} />
					</div>
				</div>

				{isFlowsLoading && <Skeleton className="h-96 w-full rounded-xl" />}

				{!isFlowsLoading && isFlowsError && (
					<div className="flex items-center justify-center py-16 rounded-xl border border-border-subtle bg-bg-card">
						<EmptyState
							message="데이터를 불러오지 못했습니다"
							iconColor="var(--color-error)"
						/>
					</div>
				)}

				{!isFlowsLoading && !isFlowsError && flows && (
					<div className="p-4 rounded-xl border border-border-subtle bg-bg-card">
						<PathsSankeyChart flows={flows} />
					</div>
				)}
			</div>
		</div>
	)
}

export default PathsDashboard
