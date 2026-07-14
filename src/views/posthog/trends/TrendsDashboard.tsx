"use client";

import { useQueryClient } from "@tanstack/react-query";
import type { ReactElement } from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useEventKpi } from "@/entities/event/api/getEventKpi";
import {
	type EventStatsInfiniteData,
	getEventStats,
	useAllEventStats,
	useEventStats,
} from "@/entities/event/api/getEventStats";
import type { EventCategory } from "@/entities/event/model/eventCategory";
import {
	EVENT_STATS_REFETCH_INTERVAL_MS,
	EVENT_TAB_TO_PERIOD,
	type EventStats,
	type Period,
} from "@/entities/event/model/eventStats";
import { getPeakLabel } from "@/entities/event/model/eventStatsUtils";
import { CHART_COLOR_PALETTE } from "@/shared/config/chartColors";
import useApiErrorToast from "@/shared/hooks/useApiErrorToast";
import EmptyState from "@/shared/ui/EmptyState";
import PathDropdown from "@/shared/ui/PathDropdown";
import type { Period as TabPeriod } from "@/shared/ui/PeriodTab";
import { Spinner } from "@/shared/ui/spinner";
import CategoryDropdown from "@/views/posthog/trends/CategoryDropdown";
import PeriodDropdown from "@/views/posthog/trends/PeriodDropdown";
import CountdownText from "@/widgets/posthog/trends/CountdownText";
import EventBarChart from "@/widgets/posthog/trends/EventBarChart";
import EventComparisonChart, {
	COMPARISON_EVENTS,
} from "@/widgets/posthog/trends/EventComparisonChart";
import EventLineChart from "@/widgets/posthog/trends/EventLineChart";
import EventStatCard from "@/widgets/posthog/trends/EventStatCard";
import EventStatsDashboardSkeleton from "@/widgets/posthog/trends/EventStatsDashboardSkeleton";
import KpiDualPanel, {
	KpiDualPanelSkeleton,
} from "@/widgets/posthog/trends/KpiDualPanel";

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
	const {
		data,
		isLoading,
		isError,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useEventStats(period, activePath, activeCategory, committedQuery);
	const queryClient = useQueryClient();

	// EventComparisonChart는 고정된 5개 잘 알려진 이벤트만 그리는 위젯이라, 검색으로 좁혀진
	// (그리고 페이지네이션된) originalEvents를 그대로 쓰면 검색어에 해당 이벤트가 없을 때
	// 그래프가 텅 비어 버린다. category만 반영하고 검색/페이지네이션과는 무관한 별도 조회로 분리
	const { data: comparisonData, isError: isComparisonError } = useAllEventStats(
		period,
		activePath,
		activeCategory,
	);
	const comparisonEvents = (comparisonData?.events ?? []).filter((ev) =>
		COMPARISON_EVENTS.includes(ev.event),
	);

	// react-query의 dataUpdatedAt은 스크롤로 fetchNextPage가 호출될 때도 갱신되어
	// "5분 주기 자동 갱신" 시점과 구분이 안 되므로, 별도 상태로 직접 관리한다
	const [refreshedAt, setRefreshedAt] = useState(0);
	const prevRefreshedAt = useRef(0);

	// 현재 필터 조건의 최초 로드가 끝난 시점을 refreshedAt 기준값으로 기록.
	// setTimeout으로 감싸 effect 콜백 최상위에서 setState를 직접 호출하지 않도록 함
	// (react-hooks/set-state-in-effect 회피 — CountdownText.tsx의 setInterval과 동일한 패턴).
	// Date.now()는 impure하므로 렌더 중이 아닌 effect 안에서만 호출한다
	useEffect(() => {
		if (isLoading || isError || refreshedAt !== 0) return;
		const timer = setTimeout(() => setRefreshedAt(Date.now()), 0);
		return () => clearTimeout(timer);
	}, [isLoading, isError, refreshedAt]);

	useEffect(() => {
		if (refreshedAt === 0) return;

		// prevRefreshedAt === 0이면 최초 로드이므로 성공 토스트를 건너뜀
		if (prevRefreshedAt.current !== 0) {
			toast.success("데이터가 최신화되었습니다.", { id: UPDATE_TOAST_ID });
		}
		prevRefreshedAt.current = refreshedAt;

		// 매초 폴링 없이 정확한 시점에 한 번만 토스트를 띄우기 위해 setTimeout 사용
		const timer = setTimeout(() => {
			toast.loading("데이터 최신화 중...", { id: UPDATE_TOAST_ID });
		}, EVENT_STATS_REFETCH_INTERVAL_MS - TOAST_WARN_MS);

		return () => clearTimeout(timer);
	}, [refreshedAt]);

	// category/search는 서버 쿼리 파라미터라 변경 시 새로 fetch되므로,
	// 탭·경로 전환과 동일하게 첫 로드를 갱신으로 오인하지 않도록 refreshedAt을 초기화한다
	const resetToastRefs = () => {
		prevRefreshedAt.current = 0;
		setRefreshedAt(0);
	};

	const handleTabChange = (next: TabPeriod) => {
		setActiveTab(next);
		resetToastRefs();
	};

	const handlePathChange = (next: string) => {
		setActivePath(next);
		resetToastRefs();
	};

	const handleCategoryChange = (next: EventCategory) => {
		setActiveCategory(next);
		resetToastRefs();
	};

	const handleSearchCommit = () => {
		setCommittedQuery(searchInput);
		resetToastRefs();
	};

	// 5분 자동 갱신 — useInfiniteQuery 기본 refetchInterval(또는 refetch())은 로드된 모든
	// 페이지를 순차 재조회하므로, 스크롤로 여러 페이지를 불러온 상태에서 요청이 폭증한다.
	// TanStack Query v5는 refetch()에 특정 페이지만 골라 재조회하는 옵션을 제공하지 않으므로,
	// 첫 페이지만 별도로 fetch해 캐시의 pages[0]만 교체 — 요청 수를 억제하고 스크롤 위치를 보존한다
	useEffect(() => {
		const timer = setInterval(async () => {
			const freshFirstPage = await getEventStats(
				period,
				activePath,
				activeCategory,
				committedQuery,
			);
			queryClient.setQueryData<EventStatsInfiniteData>(
				["events", "stats", period, activePath, activeCategory, committedQuery],
				(old) =>
					old && old.pages.length > 0
						? {
								pages: [freshFirstPage, ...old.pages.slice(1)],
								pageParams: old.pageParams,
							}
						: old,
			);
			setRefreshedAt(Date.now());
		}, EVENT_STATS_REFETCH_INTERVAL_MS);
		return () => clearInterval(timer);
	}, [period, activePath, activeCategory, committedQuery, queryClient]);

	useApiErrorToast(
		isError,
		"데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
	);
	useApiErrorToast(
		isKpiError,
		"KPI 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
	);
	useApiErrorToast(
		isComparisonError,
		"비교 그래프 데이터를 불러오지 못했습니다.",
	);

	const nextUpdateAt =
		refreshedAt !== 0 ? refreshedAt + EVENT_STATS_REFETCH_INTERVAL_MS : null;

	// category·검색 필터는 이제 서버(HogQL)에서 처리되므로, 여러 페이지를 평탄화하기만 하면 됨
	const originalEvents = data?.pages.flatMap((page) => page.events) ?? [];

	return (
		<div className="flex flex-col gap-6 p-6 h-full">
			<h1 className="text-h1 font-bold text-text-primary">Event Trends</h1>

			{/* 상단: KPI 듀얼 패널 (고정 기간 — 오늘/7일) */}
			{isKpiLoading && <KpiDualPanelSkeleton />}
			{kpiData && <KpiDualPanel data={kpiData} />}

			{/* 중단: 기간 / 카테고리 드롭다운 + 이벤트명 검색 */}
			<div className="flex flex-col gap-2">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div className="flex flex-wrap items-center gap-2">
						<PeriodDropdown value={activeTab} onChange={handleTabChange} />
						<CategoryDropdown
							value={activeCategory}
							onChange={handleCategoryChange}
						/>
						<PathDropdown value={activePath} onChange={handlePathChange} />
					</div>
					<div className="relative flex items-center w-full sm:w-auto">
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
								if (e.key === "Enter") handleSearchCommit();
							}}
							placeholder="Enter로 검색"
							aria-label="이벤트명 검색"
							className="pl-9 pr-3 py-1 w-full sm:w-64 lg:w-80 rounded-md border border-border-base bg-bg-card text-body2 text-text-primary placeholder:text-text-tertiary outline-none focus:border-border-focus transition-colors duration-150"
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
			{!isLoading && !isError && originalEvents.length === 0 && (
				<div className="flex flex-1 items-center justify-center">
					<EmptyState message="이벤트 데이터가 없습니다" />
				</div>
			)}

			{/* comparisonEvents는 검색/페이지네이션과 무관한 별도 조회 결과 — 검색 중에도 항상
			    COMPARISON_EVENTS 5개 기준으로 표시되고, 해당 이벤트가 하나도 없을 때만 숨김 */}
			{!isLoading &&
				!isError &&
				period !== "day" &&
				comparisonEvents.length > 0 && (
					<EventComparisonChart events={comparisonEvents} />
				)}

			{!isLoading && !isError && (
				<InfiniteEventList
					events={originalEvents}
					period={period}
					hasNextPage={!!hasNextPage}
					isFetchingNextPage={isFetchingNextPage}
					fetchNextPage={fetchNextPage}
				/>
			)}
		</div>
	);
};

// API 기반 무한스크롤 리스트 — Sentry InfiniteErrorList와 동일한 IntersectionObserver 패턴
const InfiniteEventList = ({
	events,
	period,
	hasNextPage,
	isFetchingNextPage,
	fetchNextPage,
}: {
	events: EventStats[];
	period: Period;
	hasNextPage: boolean;
	isFetchingNextPage: boolean;
	fetchNextPage: () => void;
}): ReactElement => {
	const observerRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const el = observerRef.current;
		if (!el) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
					fetchNextPage();
				}
			},
			{ threshold: 0.1 },
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

	return (
		<>
			{events.map((ev, index) => (
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
							color={CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length]}
						/>
					) : (
						<EventLineChart
							breakdown={ev.breakdown}
							color={CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length]}
						/>
					)}
				</EventStatCard>
			))}
			{hasNextPage && (
				<div
					ref={observerRef}
					className="h-16 flex flex-col items-center justify-center gap-2"
				>
					{isFetchingNextPage && (
						<Spinner className="size-8 [animation-duration:1.5s]" />
					)}
				</div>
			)}
		</>
	);
};

export default TrendsDashboard;
