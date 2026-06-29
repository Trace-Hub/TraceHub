"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import { useLifecycle } from "@/entities/event/api/getLifecycle";
import {
	LIFECYCLE_TAB_TO_PERIOD,
	type LifecycleTab,
} from "@/entities/event/model/lifecycle";
import useApiErrorToast from "@/shared/hooks/useApiErrorToast";
import EmptyState from "@/shared/ui/EmptyState";
import LifecycleActiveSection from "@/views/posthog/LifecycleActiveSection";
import LifecycleDashboardSkeleton from "@/views/posthog/LifecycleDashboardSkeleton";
import LifecycleSegmentCards from "@/views/posthog/LifecycleSegmentCards";
import LifecycleTotalChart from "@/views/posthog/LifecycleTotalChart";

// ISO timestamp → "Jun 25 2026 - 10:19PM KST"
const formatTimestamp = (isoString: string): string => {
	const date = new Date(isoString);
	const formatted = date.toLocaleString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		timeZone: "Asia/Seoul",
		hour12: true,
	});
	return `${formatted} KST`;
};

const LifecycleDashboard = (): ReactElement => {
	const [activeTab, setActiveTab] = useState<LifecycleTab>("7일");
	const period = LIFECYCLE_TAB_TO_PERIOD[activeTab];
	const { data, isLoading, isError } = useLifecycle(period);

	useApiErrorToast(
		isError,
		"데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
	);

	const isEmpty = !isLoading && !isError && data?.totalCount === 0;

	return (
		<div className="flex flex-col gap-6 p-6">
			{/* 최상단: 타이틀 + 기준 시각 */}
			<div>
				<h2 className="text-h1 font-bold text-text-primary">User Lifecycle</h2>
				{data?.lastUpdated && (
					<p className="text-caption text-text-tertiary mt-0.5">
						Data as of {formatTimestamp(data.lastUpdated)}
					</p>
				)}
			</div>

			{isLoading && <LifecycleDashboardSkeleton />}

			{!isLoading && isError && (
				<div className="flex flex-1 items-center justify-center py-16">
					<EmptyState
						message="데이터를 불러오지 못했습니다"
						iconColor="var(--color-error)"
					/>
				</div>
			)}

			{isEmpty && (
				<div className="flex flex-1 items-center justify-center py-16">
					<EmptyState message="라이프사이클 데이터가 없습니다" />
				</div>
			)}

			{!isLoading && !isError && data && !isEmpty && (
				<>
					{/* 상단: 활성 사용자 요약 + 기간 탭 */}
					<LifecycleActiveSection
						activeCount={data.activeCount}
						previousActiveCount={data.previousActiveCount}
						segments={data.segments}
						period={period}
						activeTab={activeTab}
						onTabChange={setActiveTab}
					/>

					{/* 중단: 6개 세그먼트 카드 */}
					<LifecycleSegmentCards segments={data.segments} period={period} />

					{/* 하단: 전체 사용자 분포 차트 */}
					<LifecycleTotalChart
						segments={data.segments}
						totalCount={data.totalCount}
					/>
				</>
			)}
		</div>
	);
};

export default LifecycleDashboard;
