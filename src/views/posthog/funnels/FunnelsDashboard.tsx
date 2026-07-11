"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import { useFunnel } from "@/entities/event/api/getFunnel";
import {
	FUNNEL_TAB_TO_PERIOD,
	type FunnelTab,
} from "@/entities/event/model/funnel";
import { formatPct } from "@/shared/lib/formatters";
import { FUNNEL_CONFIG } from "@/shared/config/funnelConfig";
import useApiErrorToast from "@/shared/hooks/useApiErrorToast";
import AnimatedNumber from "@/shared/ui/AnimatedNumber";
import Dropdown from "@/shared/ui/Dropdown";
import EmptyState from "@/shared/ui/EmptyState";
import FunnelDashboardSkeleton from "@/widgets/posthog/funnels/FunnelDashboardSkeleton";
import FunnelStepCards from "@/widgets/posthog/funnels/FunnelStepCards";
import FunnelTrendChart from "@/widgets/posthog/funnels/FunnelTrendChart";
import FunnelVisualChart from "@/widgets/posthog/funnels/FunnelVisualChart";

const FUNNEL_TABS: FunnelTab[] = ["7일", "30일"];

const FUNNEL_OPTIONS = FUNNEL_CONFIG.map((f) => ({ value: f.id, label: f.name }));

const FunnelsDashboard = (): ReactElement => {
	const [activeFunnelId, setActiveFunnelId] = useState<string>(
		FUNNEL_CONFIG[0]?.id ?? "default",
	);
	const [activeTab, setActiveTab] = useState<FunnelTab>("7일");

	const period = FUNNEL_TAB_TO_PERIOD[activeTab];
	const { data, isLoading, isError } = useFunnel(activeFunnelId, period);

	const activeFunnelName =
		FUNNEL_OPTIONS.find((o) => o.value === activeFunnelId)?.label ?? "";
	const activeFunnelStepCount =
		FUNNEL_CONFIG.find((f) => f.id === activeFunnelId)?.steps.length ?? 4;

	useApiErrorToast(
		isError,
		"퍼널 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
	);

	return (
		<div className="flex flex-col gap-6 p-6 h-full">
			{/* 페이지 헤더 */}
			<div className="flex items-start justify-between gap-4">
				<div>
					<h1 className="text-h1 font-bold text-text-primary">Funnels</h1>
					<p className="text-body2 text-text-secondary mt-1">
						정의된 이벤트 순서대로 사용자 전환율을 분석합니다.
					</p>
				</div>
				{/* 기간 탭 */}
				<div
					role="tablist"
					aria-label="기간 선택"
					className="inline-flex items-center gap-1 shrink-0"
				>
					{FUNNEL_TABS.map((tab) => (
						<button
							key={tab}
							type="button"
							role="tab"
							aria-selected={activeTab === tab}
							onClick={() => setActiveTab(tab)}
							className={`px-3 py-1.5 rounded-md text-body2 font-medium transition-[background-color,color] duration-150 ease-in-out ${
								activeTab === tab
									? "bg-primary text-white"
									: "text-text-secondary hover:text-text-primary"
							}`}
						>
							{tab}
						</button>
					))}
				</div>
			</div>

			{/* 퍼널 선택 드롭다운 */}
			{FUNNEL_CONFIG.length > 1 && (
				<Dropdown
					value={activeFunnelId}
					onChange={setActiveFunnelId}
					options={FUNNEL_OPTIONS}
					ariaLabel="퍼널 선택"
					className="self-start"
				/>
			)}

			{isLoading && <FunnelDashboardSkeleton stepCount={activeFunnelStepCount} />}

			{!isLoading && isError && (
				<div className="flex flex-1 items-center justify-center py-16">
					<EmptyState
						message="데이터를 불러오지 못했습니다"
						iconColor="var(--color-error)"
					/>
				</div>
			)}

			{!isLoading && !isError && data && (
				<>
					{/* KPI 카드 2개 */}
					<div className="grid grid-cols-2 gap-4">
						<div className="flex flex-col gap-1 p-4 rounded-xl border border-border-subtle bg-bg-card">
							<span className="text-caption text-text-tertiary">
								전체 전환율
							</span>
							<span className="text-h1 font-bold text-text-primary">
								<AnimatedNumber
									value={data.kpi.overallConversionRate}
									format={formatPct}
								/>
							</span>
							<span className="text-caption text-text-tertiary">
								{activeFunnelName} 첫 단계 → 마지막 단계
							</span>
						</div>
						<div className="flex flex-col gap-1 p-4 rounded-xl border border-border-subtle bg-bg-card">
							<span className="text-caption text-text-tertiary">
								최대 이탈 단계
							</span>
							<span className="text-h1 font-bold text-error">
								<AnimatedNumber
									value={data.kpi.maxDropoffRate}
									format={formatPct}
								/>
							</span>
							<span className="text-caption text-text-tertiary">
								{data.kpi.maxDropoffStepLabel} 단계
							</span>
						</div>
					</div>

					{/* 단계별 카드 (2/3) + 깔때기 시각화 (1/3) */}
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
						<div className="lg:col-span-2">
							<FunnelStepCards steps={data.steps} />
						</div>
						<div className="p-4 rounded-xl border border-border-subtle bg-bg-card">
							<span className="text-body2 font-medium text-text-secondary block mb-3">
								단계별 비율
							</span>
							<FunnelVisualChart steps={data.steps} />
						</div>
					</div>

					{/* 전환율 추이 차트 */}
					<div className="flex flex-col gap-3 p-4 rounded-xl border border-border-subtle bg-bg-card">
						<span className="text-body2 font-medium text-text-secondary">
							전환율 추이
						</span>
						<FunnelTrendChart trend={data.trend} />
					</div>
				</>
			)}
		</div>
	);
};

export default FunnelsDashboard;
