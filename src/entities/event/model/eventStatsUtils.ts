import type {
	EventPeriodCount,
	Period,
} from "@/entities/event/model/eventStats";
import {
	KST_OFFSET,
	buildKstPeriodFilter,
	buildKstPreviousPeriodFilter,
} from "@/shared/lib/posthogServer";
import dayjs from "@/shared/lib/dayjs";

interface HogQLQueries {
	current: string;
	previous: string;
}

const buildQueries = (period: Period, pathFilter: string): HogQLQueries => {
	const currentFilter = buildKstPeriodFilter(period);
	const previousFilter = buildKstPreviousPeriodFilter(period);
	// day는 시간(toHour), week/month는 날짜(toDate)로 집계 단위가 다름
	const unitExpr =
		period === "day"
			? `toHour(timestamp + ${KST_OFFSET})`
			: `toDate(timestamp + ${KST_OFFSET})`;

	return {
		current: `
      SELECT event, ${unitExpr} AS unit, count() AS count
      FROM events
      WHERE ${currentFilter}
      AND ${pathFilter}
      GROUP BY event, unit
      ORDER BY event, unit ASC
    `,
		previous: `
      SELECT event, count() AS count
      FROM events
      WHERE ${previousFilter}
      AND ${pathFilter}
      GROUP BY event
    `,
	};
};

const buildEmptyBreakdown = (period: Period): EventPeriodCount[] => {
	if (period === "day") {
		return Array.from({ length: 24 }, (_, h) => ({
			label: `${h}시`,
			count: 0,
		}));
	}

	const days = period === "week" ? 7 : 30;
	// Vercel 서버가 UTC이므로 KST 기준으로 오늘 날짜를 계산
	const today = dayjs().tz("Asia/Seoul");
	return Array.from({ length: days }, (_, i) => {
		const label = today.subtract(days - 1 - i, "day").format("MM/DD");
		return { label, count: 0 };
	});
};

const toLabel = (unit: string | number, period: Period): string => {
	if (period === "day") {
		return `${Number(unit)}시`;
	}
	// unit은 "YYYY-MM-DD" 형식
	return dayjs(String(unit)).format("MM/DD");
};

const calcChangeRate = (current: number, previous: number): number => {
	if (previous === 0) return current === 0 ? 0 : 100;
	return Math.round(((current - previous) / previous) * 100);
};

const getPeakLabel = (breakdown: EventPeriodCount[]): string => {
	if (breakdown.length === 0) return "-";
	return breakdown.reduce((a, b) => (a.count >= b.count ? a : b)).label;
};

const calcAverage = (breakdown: EventPeriodCount[]): number => {
	if (breakdown.length === 0) return 0;
	const total = breakdown.reduce((sum, b) => sum + b.count, 0);
	return Math.round((total / breakdown.length) * 10) / 10;
};

const getYAxisTicks = (maxValue: number): number[] => {
	if (maxValue < 100) return [0, 20, 40, 60, 80, 100];
	if (maxValue < 1000) return [0, 200, 400, 600, 800, 1000];
	if (maxValue < 10000) return [0, 2000, 4000, 6000, 8000, 10000];
	return [0, 20000, 40000, 60000, 80000, 100000];
};

export {
	buildEmptyBreakdown,
	buildQueries,
	calcAverage,
	calcChangeRate,
	getPeakLabel,
	getYAxisTicks,
	toLabel,
};
