import type {
	EventPeriodCount,
	Period,
} from "@/entities/event/model/eventStats";
import type { Breakpoint } from "@/shared/hooks/useBreakpoint";
import dayjs from "@/shared/lib/dayjs";
import {
	buildKstPeriodFilter,
	buildKstPreviousPeriodFilter,
	KST_OFFSET,
} from "@/shared/lib/posthogServer";

// QA: 시간대별 발생 현황 그래프 반응형 간격 — Desktop 1시간 / Tablet 2시간 / Mobile 4시간
// EventBarChart(목록)와 EventDetailTrendChart(상세) 양쪽에서 동일하게 참조하는 단일 기준
const BREAKPOINT_TO_INTERVAL_HOURS: Record<Breakpoint, number> = {
	desktop: 1,
	tablet: 2,
	mobile: 4,
};

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

// 시간대별(1시간 단위) breakdown을 intervalHours 단위로 합산 — 반응형 그래프 간격에 사용
// 합산된 값인데 라벨이 구간 시작 시각(예: "0시")만 보이면 그 한 시간에만 발생한 것처럼
// 오독될 수 있어, 두 시간 이상 묶인 구간은 "시작~끝" 범위로 라벨을 표시한다
const groupBreakdownByInterval = (
	breakdown: EventPeriodCount[],
	intervalHours: number,
): EventPeriodCount[] => {
	if (intervalHours <= 1) return breakdown;

	const grouped: EventPeriodCount[] = [];
	for (let i = 0; i < breakdown.length; i += intervalHours) {
		const chunk = breakdown.slice(i, i + intervalHours);
		const last = chunk[chunk.length - 1];
		grouped.push({
			label:
				chunk.length > 1 ? `${chunk[0].label}~${last.label}` : chunk[0].label,
			count: chunk.reduce((sum, b) => sum + b.count, 0),
		});
	}
	return grouped;
};

export {
	BREAKPOINT_TO_INTERVAL_HOURS,
	buildEmptyBreakdown,
	buildQueries,
	calcAverage,
	calcChangeRate,
	getPeakLabel,
	getYAxisTicks,
	groupBreakdownByInterval,
	toLabel,
};
