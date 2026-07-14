import type { EventCategory } from "@/entities/event/model/eventCategory";
import type {
	EventPeriodCount,
	EventStats,
	EventStatsResponse,
	Period,
} from "@/entities/event/model/eventStats";
import {
	buildQueries,
	buildSelectionQuery,
	decodeCursor,
	encodeCursor,
} from "@/entities/event/model/eventStatsQuery";
import {
	buildEmptyBreakdown,
	toLabel,
} from "@/entities/event/model/eventStatsUtils";
import { runHogQLQuery } from "@/shared/lib/posthogServer";

// 이벤트 목록 무한스크롤 페이지당 개수 — 브레이크다운 차트를 포함해 카드가 커서 5(Sentry 이슈 카드 기준)보다 적게 설정
const PER_PAGE = 3;

// route에서 허용하는 최대 limit — OverviewChart처럼 전체 이벤트 타입 합계가 필요한 소비처가
// limit을 크게 지정해도(예: 100) 이 범위를 넘지 못하도록 상한선 역할
const MAX_LIMIT = 200;

const fetchEventStatsServer = async (
	period: Period,
	pathFilter: string,
	category: EventCategory,
	search: string,
	cursorParam: string | null,
	limit: number = PER_PAGE,
): Promise<EventStatsResponse> => {
	const cursor = cursorParam ? decodeCursor(cursorParam) : null;

	// 1단계: 이번 페이지에 노출할 이벤트명 + currentTotal 선정
	const selectionQuery = buildSelectionQuery(
		period,
		pathFilter,
		category,
		search,
		cursor,
		limit,
	);
	const selection = await runHogQLQuery(selectionQuery);

	const pageEvents = selection.results.map((row) => {
		// PostHog HogQL results는 비타입 배열 — 쿼리 컬럼 순서 [event, total]을 명시적으로 지정했으므로 안전
		const [event, total] = row as [string, number];
		return { event, total: Number(total) };
	});

	if (pageEvents.length === 0) {
		return { period, events: [], nextCursor: null };
	}

	// 2단계: 선정된 이벤트만 breakdown·이전 기간 합계 조회
	const eventNames = pageEvents.map((e) => e.event);
	const { current: currentQuery, previous: previousQuery } = buildQueries(
		period,
		pathFilter,
		eventNames,
	);

	const [current, previous] = await Promise.all([
		runHogQLQuery(currentQuery),
		runHogQLQuery(previousQuery),
	]);

	const previousMap = new Map<string, number>();
	for (const row of previous.results) {
		// PostHog HogQL results는 비타입 배열 — 쿼리 컬럼 순서 [event, count]를 명시적으로 지정했으므로 안전
		const [event, count] = row as [string, number];
		previousMap.set(event, Number(count));
	}

	const breakdownMap = new Map<string, EventPeriodCount[]>();
	for (const row of current.results) {
		// PostHog HogQL results는 비타입 배열 — 쿼리 컬럼 순서 [event, unit, count]를 명시적으로 지정했으므로 안전
		const [event, unit, count] = row as [string, string | number, number];
		if (!breakdownMap.has(event)) {
			breakdownMap.set(event, buildEmptyBreakdown(period));
		}
		// has() 검증 완료 후 get()이 항상 정의된 값을 반환하므로 안전
		const breakdown = breakdownMap.get(event) as EventPeriodCount[];
		const label = toLabel(unit, period);
		const slot = breakdown.find((b) => b.label === label);
		if (slot) {
			slot.count = Number(count);
		}
	}

	// 1단계에서 정렬된 순서(currentTotal 내림차순)를 그대로 유지
	const events: EventStats[] = pageEvents.map(({ event, total }) => ({
		event,
		currentTotal: total,
		previousTotal: previousMap.get(event) ?? 0,
		breakdown: breakdownMap.get(event) ?? buildEmptyBreakdown(period),
	}));

	// 이번 페이지가 꽉 찼을 때만 다음 페이지가 있을 가능성이 있다고 보고 커서를 내려줌
	const last = pageEvents[pageEvents.length - 1];
	const nextCursor =
		pageEvents.length === limit
			? encodeCursor({ total: last.total, event: last.event })
			: null;

	return { period, events, nextCursor };
};

export { fetchEventStatsServer, MAX_LIMIT, PER_PAGE };
