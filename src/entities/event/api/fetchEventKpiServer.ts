import type {
	EventKpiResponse,
	KpiBreakdownPoint,
} from "@/entities/event/model/eventStats";
import dayjs from "@/shared/lib/dayjs";
import {
	buildKstPreviousPeriodFilter,
	KST_OFFSET,
	runHogQLQuery,
} from "@/shared/lib/posthogServer";

const buildEmptyKpiBreakdown = (
	period: "day" | "week",
): KpiBreakdownPoint[] => {
	if (period === "day") {
		return Array.from({ length: 24 }, (_, h) => ({
			label: `${h}시`,
			activeUsers: 0,
			totalEvents: 0,
		}));
	}
	const today = dayjs().tz("Asia/Seoul");
	return Array.from({ length: 7 }, (_, i) => ({
		label: today.subtract(6 - i, "day").format("MM/DD"),
		activeUsers: 0,
		totalEvents: 0,
	}));
};

const fetchEventKpiServer = async (
	pathFilter: string,
): Promise<EventKpiResponse> => {
	const prevDayFilter = buildKstPreviousPeriodFilter("day");
	const prevWeekFilter = buildKstPreviousPeriodFilter("week");

	// 오늘: 전체 + 어제(증감률용) + 시간대별 breakdown
	const todayTotalQuery = `
    SELECT count(distinct person_id) AS activeUsers, count() AS totalEvents
    FROM events
    WHERE toDate(timestamp + ${KST_OFFSET}) = toDate(now() + ${KST_OFFSET})
    AND ${pathFilter}
  `;

	const prevDayTotalQuery = `
    SELECT count(distinct person_id) AS activeUsers, count() AS totalEvents
    FROM events
    WHERE ${prevDayFilter}
    AND ${pathFilter}
  `;

	const todayBreakdownQuery = `
    SELECT
      toHour(timestamp + ${KST_OFFSET}) AS unit,
      count(distinct person_id) AS activeUsers,
      count() AS totalEvents
    FROM events
    WHERE toDate(timestamp + ${KST_OFFSET}) = toDate(now() + ${KST_OFFSET})
    AND ${pathFilter}
    GROUP BY unit
    ORDER BY unit ASC
  `;

	// 7일: 전체 + 전주(증감률용) + 일자별 breakdown
	const weekTotalQuery = `
    SELECT count(distinct person_id) AS activeUsers, count() AS totalEvents
    FROM events
    WHERE toDate(timestamp + ${KST_OFFSET}) >= toDate(now() + ${KST_OFFSET}) - 6
    AND ${pathFilter}
  `;

	const prevWeekTotalQuery = `
    SELECT count(distinct person_id) AS activeUsers, count() AS totalEvents
    FROM events
    WHERE ${prevWeekFilter}
    AND ${pathFilter}
  `;

	const weekBreakdownQuery = `
    SELECT
      toDate(timestamp + ${KST_OFFSET}) AS unit,
      count(distinct person_id) AS activeUsers,
      count() AS totalEvents
    FROM events
    WHERE toDate(timestamp + ${KST_OFFSET}) >= toDate(now() + ${KST_OFFSET}) - 6
    AND ${pathFilter}
    GROUP BY unit
    ORDER BY unit ASC
  `;

	const [
		todayTotal,
		prevDayTotal,
		todayBreakdownResult,
		weekTotal,
		prevWeekTotal,
		weekBreakdownResult,
	] = await Promise.all([
		runHogQLQuery(todayTotalQuery),
		runHogQLQuery(prevDayTotalQuery),
		runHogQLQuery(todayBreakdownQuery),
		runHogQLQuery(weekTotalQuery),
		runHogQLQuery(prevWeekTotalQuery),
		runHogQLQuery(weekBreakdownQuery),
	]);

	// count() 집계는 항상 1행 반환 — 이벤트 없어도 [0, 0] 행이 온다
	const [todayActiveUsers = 0, todayTotalEvents = 0] = (todayTotal.results[0] ??
		[]) as [number, number];
	const [prevDayActiveUsers = 0, prevDayTotalEvents = 0] = (prevDayTotal
		.results[0] ?? []) as [number, number];
	const [weekActiveUsers = 0, weekTotalEvents = 0] = (weekTotal.results[0] ??
		[]) as [number, number];
	const [prevWeekActiveUsers = 0, prevWeekTotalEvents = 0] = (prevWeekTotal
		.results[0] ?? []) as [number, number];

	const todayBreakdown = buildEmptyKpiBreakdown("day");
	for (const row of todayBreakdownResult.results) {
		// 쿼리 컬럼 순서 [unit(hour), activeUsers, totalEvents]로 고정했으므로 안전
		const [unit, activeUsers, totalEvents] = row as [number, number, number];
		const label = `${unit}시`;
		const slot = todayBreakdown.find((b) => b.label === label);
		if (slot) {
			slot.activeUsers = Number(activeUsers);
			slot.totalEvents = Number(totalEvents);
		}
	}

	const weekBreakdown = buildEmptyKpiBreakdown("week");
	for (const row of weekBreakdownResult.results) {
		// 쿼리 컬럼 순서 [unit(date string), activeUsers, totalEvents]로 고정했으므로 안전
		const [unit, activeUsers, totalEvents] = row as [string, number, number];
		const label = dayjs(unit).format("MM/DD");
		const slot = weekBreakdown.find((b) => b.label === label);
		if (slot) {
			slot.activeUsers = Number(activeUsers);
			slot.totalEvents = Number(totalEvents);
		}
	}

	return {
		today: {
			activeUsers: Number(todayActiveUsers),
			totalEvents: Number(todayTotalEvents),
			previousActiveUsers: Number(prevDayActiveUsers),
			previousTotalEvents: Number(prevDayTotalEvents),
			breakdown: todayBreakdown,
		},
		week: {
			activeUsers: Number(weekActiveUsers),
			totalEvents: Number(weekTotalEvents),
			previousActiveUsers: Number(prevWeekActiveUsers),
			previousTotalEvents: Number(prevWeekTotalEvents),
			breakdown: weekBreakdown,
		},
	};
};

export { fetchEventKpiServer };
