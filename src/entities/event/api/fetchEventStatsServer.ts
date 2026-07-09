import type {
	EventPeriodCount,
	EventStats,
	EventStatsResponse,
	Period,
} from "@/entities/event/model/eventStats";
import {
	buildEmptyBreakdown,
	buildQueries,
	toLabel,
} from "@/entities/event/model/eventStatsUtils";
import { runHogQLQuery } from "@/shared/lib/posthogServer";

const fetchEventStatsServer = async (
	period: Period,
	pathFilter: string,
): Promise<EventStatsResponse> => {
	const { current: currentQuery, previous: previousQuery } = buildQueries(
		period,
		pathFilter,
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

	const eventMap = new Map<string, EventPeriodCount[]>();
	for (const row of current.results) {
		// PostHog HogQL results는 비타입 배열 — 쿼리 컬럼 순서 [event, unit, count]를 명시적으로 지정했으므로 안전
		const [event, unit, count] = row as [string, string | number, number];
		if (!eventMap.has(event)) {
			eventMap.set(event, buildEmptyBreakdown(period));
		}
		// has() 검증 완료 후 get()이 항상 정의된 값을 반환하므로 안전
		const breakdown = eventMap.get(event) as EventPeriodCount[];
		const label = toLabel(unit, period);
		const slot = breakdown.find((b) => b.label === label);
		if (slot) {
			slot.count = Number(count);
		}
	}

	const events: EventStats[] = Array.from(eventMap.entries()).map(
		([event, breakdown]) => ({
			event,
			currentTotal: breakdown.reduce((sum, b) => sum + b.count, 0),
			previousTotal: previousMap.get(event) ?? 0,
			breakdown,
		}),
	);

	return { period, events };
};

export { fetchEventStatsServer };
