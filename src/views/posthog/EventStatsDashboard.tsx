"use client";

import type { ReactElement } from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useEventStats } from "@/entities/event/api/getEventStats";
import {
	EVENT_STATS_REFETCH_INTERVAL_MS,
	EVENT_TAB_TO_PERIOD,
} from "@/entities/event/model/eventStats";
import { getPeakLabel } from "@/entities/event/model/eventStatsUtils";
import { CHART_COLOR_PALETTE } from "@/shared/config/chartColors";
import useApiErrorToast from "@/shared/hooks/useApiErrorToast";
import EmptyState from "@/shared/ui/EmptyState";
import PeriodTab, { type Period as TabPeriod } from "@/shared/ui/PeriodTab";
import CountdownText from "@/views/posthog/CountdownText";
import EventBarChart from "@/views/posthog/EventBarChart";
import EventComparisonChart from "@/views/posthog/EventComparisonChart";
import EventLineChart from "@/views/posthog/EventLineChart";
import EventStatCard from "@/views/posthog/EventStatCard";
import EventStatsDashboardSkeleton from "@/views/posthog/EventStatsDashboardSkeleton";

const TOAST_WARN_MS = 5_000;
const UPDATE_TOAST_ID = "update";

const EventStatsDashboard = (): ReactElement => {
	const [activeTab, setActiveTab] = useState<TabPeriod>("오늘");
	const period = EVENT_TAB_TO_PERIOD[activeTab];
	const { data, isLoading, isError, dataUpdatedAt } = useEventStats(period);

	const prevDataUpdatedAt = useRef(dataUpdatedAt);

	useEffect(() => {
		if (dataUpdatedAt === 0) return;

		if (prevDataUpdatedAt.current !== 0) {
			toast.success("데이터가 최신화되었습니다.", { id: UPDATE_TOAST_ID });
		}
		prevDataUpdatedAt.current = dataUpdatedAt;

		// 매초 폴링 없이 정확한 시점에 한 번만 토스트를 띄우기 위해 setTimeout 사용
		const timer = setTimeout(() => {
			toast.loading("데이터 최신화 중...", { id: UPDATE_TOAST_ID });
		}, EVENT_STATS_REFETCH_INTERVAL_MS - TOAST_WARN_MS);

		return () => clearTimeout(timer);
	}, [dataUpdatedAt]);

	// 탭 전환 시 ref 초기화 — 첫 로드를 갱신으로 오인해 성공 토스트가 뜨는 오류 방지
	// useEffect가 아닌 핸들러에서 처리해 exhaustive-deps 경고 없이 의도한 타이밍에 실행
	const handleTabChange = (next: TabPeriod) => {
		setActiveTab(next);
		prevDataUpdatedAt.current = 0;
	};

	useApiErrorToast(
		isError,
		"데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
	);

	const nextUpdateAt =
		dataUpdatedAt !== 0
			? dataUpdatedAt + EVENT_STATS_REFETCH_INTERVAL_MS
			: null;

	return (
		<div className="flex flex-col gap-6 p-6 h-full">
			<div className="flex items-center justify-between">
				<PeriodTab value={activeTab} onChange={handleTabChange} />
				{nextUpdateAt !== null && (
					<CountdownText nextUpdateAt={nextUpdateAt} />
				)}
			</div>

			{isLoading && <EventStatsDashboardSkeleton />}
			{!isLoading && isError && (
				<div className="flex flex-1 items-center justify-center">
					<EmptyState
						message="데이터를 불러오지 못했습니다"
						iconColor="var(--color-error)"
					/>
				</div>
			)}
			{!isLoading && !isError && data?.events.length === 0 && (
				<div className="flex flex-1 items-center justify-center">
					<EmptyState message="이벤트 데이터가 없습니다" />
				</div>
			)}

			{!isLoading &&
				!isError &&
				period !== "day" &&
				data?.events &&
				data.events.length > 0 && <EventComparisonChart events={data.events} />}

			{!isLoading &&
				!isError &&
				data?.events.map((ev, i) => (
					<EventStatCard
						key={ev.event}
						event={ev.event}
						currentTotal={ev.currentTotal}
						previousTotal={ev.previousTotal}
						peakLabel={getPeakLabel(ev.breakdown)}
						period={period}
					>
						{period === "day" ? (
							<EventBarChart
								breakdown={ev.breakdown}
								color={CHART_COLOR_PALETTE[i % CHART_COLOR_PALETTE.length]}
							/>
						) : (
							<EventLineChart
								breakdown={ev.breakdown}
								color={CHART_COLOR_PALETTE[i % CHART_COLOR_PALETTE.length]}
							/>
						)}
					</EventStatCard>
				))}
		</div>
	);
};

export default EventStatsDashboard;
