"use client";

import type { ReactElement } from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useEventKpi } from "@/entities/event/api/getEventKpi";
import { useEventStats } from "@/entities/event/api/getEventStats";
import type { EventCategory } from "@/entities/event/model/eventCategory";
import { filterEventsByCategory } from "@/entities/event/model/eventCategory";
import {
	EVENT_STATS_REFETCH_INTERVAL_MS,
	EVENT_TAB_TO_PERIOD,
} from "@/entities/event/model/eventStats";
import { getPeakLabel } from "@/entities/event/model/eventStatsUtils";
import { CHART_COLOR_PALETTE } from "@/shared/config/chartColors";
import { getEventLabel } from "@/shared/config/eventLabel";
import useApiErrorToast from "@/shared/hooks/useApiErrorToast";
import EmptyState from "@/shared/ui/EmptyState";
import type { Period as TabPeriod } from "@/shared/ui/PeriodTab";
import CategoryDropdown from "@/views/posthog/CategoryDropdown";
import CountdownText from "@/views/posthog/CountdownText";
import EventBarChart from "@/views/posthog/EventBarChart";
import EventComparisonChart from "@/views/posthog/EventComparisonChart";
import EventLineChart from "@/views/posthog/EventLineChart";
import EventStatCard from "@/views/posthog/EventStatCard";
import EventStatsDashboardSkeleton from "@/views/posthog/EventStatsDashboardSkeleton";
import KpiDualPanel, {
	KpiDualPanelSkeleton,
} from "@/views/posthog/KpiDualPanel";
import PathDropdown from "@/views/posthog/PathDropdown";
import PeriodDropdown from "@/views/posthog/PeriodDropdown";

const TOAST_WARN_MS = 5_000;
const UPDATE_TOAST_ID = "update";

const TrendsDashboard = (): ReactElement => {
	const [activeTab, setActiveTab] = useState<TabPeriod>("오늘");
	const [activeCategory, setActiveCategory] = useState<EventCategory>("all");
	const [activePath, setActivePath] = useState("all");
	const [searchInput, setSearchInput] = useState("");
	const [committedQuery, setCommittedQuery] = useState("");
	const period = EVENT_TAB_TO_PERIOD[activeTab];

	const {
		data: kpiData,
		isLoading: isKpiLoading,
		isError: isKpiError,
	} = useEventKpi();
	const { data, isLoading, isError, dataUpdatedAt } = useEventStats(
		period,
		activePath,
	);

	const prevDataUpdatedAt = useRef(0);
	// 리마운트/탭 전환 직후 첫 번째 refetch는 "갱신"이 아니므로 토스트를 건너뜀
	const skipNextSuccessToast = useRef(true);

	useEffect(() => {
		if (dataUpdatedAt === 0) return;

		if (prevDataUpdatedAt.current !== 0) {
			if (skipNextSuccessToast.current) {
				skipNextSuccessToast.current = false;
			} else {
				toast.success("데이터가 최신화되었습니다.", { id: UPDATE_TOAST_ID });
			}
		}
		prevDataUpdatedAt.current = dataUpdatedAt;

		// 매초 폴링 없이 정확한 시점에 한 번만 토스트를 띄우기 위해 setTimeout 사용
		const timer = setTimeout(() => {
			toast.loading("데이터 최신화 중...", { id: UPDATE_TOAST_ID });
		}, EVENT_STATS_REFETCH_INTERVAL_MS - TOAST_WARN_MS);

		return () => clearTimeout(timer);
	}, [dataUpdatedAt]);

	// 탭·경로 전환 시 ref 초기화 — 첫 로드를 갱신으로 오인해 성공 토스트가 뜨는 오류 방지
	const resetToastRefs = () => {
		prevDataUpdatedAt.current = 0;
		skipNextSuccessToast.current = true;
	};

	const handleTabChange = (next: TabPeriod) => {
		setActiveTab(next);
		resetToastRefs();
	};

	const handlePathChange = (next: string) => {
		setActivePath(next);
		resetToastRefs();
	};

	useApiErrorToast(
		isError,
		"데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
	);
	useApiErrorToast(
		isKpiError,
		"KPI 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
	);

	const nextUpdateAt =
		dataUpdatedAt !== 0
			? dataUpdatedAt + EVENT_STATS_REFETCH_INTERVAL_MS
			: null;

	const originalEvents = data?.events ?? [];
	const categoryFilteredEvents = filterEventsByCategory(
		originalEvents,
		activeCategory,
	);
	const filteredEvents = categoryFilteredEvents.filter((ev) => {
		if (committedQuery === "") return true;
		const q = committedQuery.toLowerCase();
		return (
			ev.event.toLowerCase().includes(q) ||
			getEventLabel(ev.event).toLowerCase().includes(q)
		);
	});

	return (
		<div className="flex flex-col gap-6 p-6 h-full">
			{/* 상단: KPI 듀얼 패널 (고정 기간 — 오늘/7일) */}
			{isKpiLoading && <KpiDualPanelSkeleton />}
			{kpiData && <KpiDualPanel data={kpiData} />}

			{/* 중단: 기간 / 카테고리 드롭다운 + 이벤트명 검색 */}
			<div className="flex flex-col gap-2">
				<div className="flex items-center justify-between gap-3">
					<div className="flex items-center gap-2">
						<PeriodDropdown value={activeTab} onChange={handleTabChange} />
						<CategoryDropdown
							value={activeCategory}
							onChange={setActiveCategory}
						/>
						<PathDropdown value={activePath} onChange={handlePathChange} />
					</div>
					<div className="relative flex items-center">
						<svg
							className="absolute left-3 pointer-events-none"
							width="14"
							height="14"
							viewBox="0 0 14 14"
							fill="none"
							aria-hidden="true"
						>
							<circle
								cx="6"
								cy="6"
								r="4.5"
								stroke="var(--color-text-tertiary)"
								strokeWidth="1.5"
							/>
							<path
								d="M10 10l2.5 2.5"
								stroke="var(--color-text-tertiary)"
								strokeWidth="1.5"
								strokeLinecap="round"
							/>
						</svg>
						<input
							type="text"
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") setCommittedQuery(searchInput);
							}}
							placeholder="이벤트명 검색"
							aria-label="이벤트명 검색"
							className="pl-9 pr-3 py-1 w-80 rounded-md border border-border-base bg-bg-card text-body2 text-text-primary placeholder:text-text-tertiary outline-none focus:border-border-focus transition-colors duration-150"
						/>
					</div>
				</div>
				{nextUpdateAt !== null && (
					<div className="flex justify-end">
						<CountdownText nextUpdateAt={nextUpdateAt} />
					</div>
				)}
			</div>

			{/* 하단: 기간별 이벤트 목록 */}
			{isLoading && <EventStatsDashboardSkeleton />}
			{!isLoading && isError && (
				<div className="flex flex-1 items-center justify-center">
					<EmptyState
						message="데이터를 불러오지 못했습니다"
						iconColor="var(--color-error)"
					/>
				</div>
			)}
			{!isLoading && !isError && filteredEvents.length === 0 && (
				<div className="flex flex-1 items-center justify-center">
					<EmptyState message="이벤트 데이터가 없습니다" />
				</div>
			)}

			{!isLoading &&
				!isError &&
				period !== "day" &&
				categoryFilteredEvents.length > 0 && (
					<EventComparisonChart
						events={[...categoryFilteredEvents]
							.sort((a, b) => b.currentTotal - a.currentTotal)
							.slice(0, 5)}
					/>
				)}

			{!isLoading &&
				!isError &&
				filteredEvents.map((ev) => {
					// 카테고리 필터 전환 시 색상이 바뀌지 않도록 원본 배열 기준 인덱스 사용
					const colorIndex = originalEvents.indexOf(ev);
					return (
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
									color={
										CHART_COLOR_PALETTE[colorIndex % CHART_COLOR_PALETTE.length]
									}
								/>
							) : (
								<EventLineChart
									breakdown={ev.breakdown}
									color={
										CHART_COLOR_PALETTE[colorIndex % CHART_COLOR_PALETTE.length]
									}
								/>
							)}
						</EventStatCard>
					);
				})}
		</div>
	);
};

export default TrendsDashboard;
