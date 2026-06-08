import type {
	EventPeriodCount,
	Period,
	RelatedEvent,
} from "@/entities/event/model/eventStats";
import { getEventLabel } from "@/shared/config/eventLabel";
import dayjs from "@/shared/lib/dayjs";

type LabeledRelatedEvent = RelatedEvent & { label: string };

interface HogQLQueries {
	current: string;
	previous: string;
}

// PostHog는 UTC로 timestamp를 저장 — KST(UTC+9) 기준으로 맞추려면 +9시간 오프셋 적용
// toTimezone 대신 INTERVAL 산술로 처리 (PostHog HogQL 호환성이 더 높음)
const KST_OFFSET = "INTERVAL 9 HOUR";

const buildQueries = (period: Period, pathFilter: string): HogQLQueries => {
	switch (period) {
		case "day":
			return {
				current: `
          SELECT event, toHour(timestamp + ${KST_OFFSET}) AS unit, count() AS count
          FROM events
          WHERE toDate(timestamp + ${KST_OFFSET}) = toDate(now() + ${KST_OFFSET})
          AND ${pathFilter}
          GROUP BY event, unit
          ORDER BY event, unit ASC
        `,
				previous: `
          SELECT event, count() AS count
          FROM events
          WHERE toDate(timestamp + ${KST_OFFSET}) = toDate(now() + ${KST_OFFSET}) - 1
          AND ${pathFilter}
          GROUP BY event
        `,
			};
		case "week":
			return {
				current: `
          SELECT event, toDate(timestamp + ${KST_OFFSET}) AS unit, count() AS count
          FROM events
          WHERE toDate(timestamp + ${KST_OFFSET}) >= toDate(now() + ${KST_OFFSET}) - 6
          AND ${pathFilter}
          GROUP BY event, unit
          ORDER BY event, unit ASC
        `,
				previous: `
          SELECT event, count() AS count
          FROM events
          WHERE toDate(timestamp + ${KST_OFFSET}) >= toDate(now() + ${KST_OFFSET}) - 13
            AND toDate(timestamp + ${KST_OFFSET}) <= toDate(now() + ${KST_OFFSET}) - 7
          AND ${pathFilter}
          GROUP BY event
        `,
			};
		case "month":
			return {
				current: `
          SELECT event, toDate(timestamp + ${KST_OFFSET}) AS unit, count() AS count
          FROM events
          WHERE toDate(timestamp + ${KST_OFFSET}) >= toDate(now() + ${KST_OFFSET}) - 29
          AND ${pathFilter}
          GROUP BY event, unit
          ORDER BY event, unit ASC
        `,
				previous: `
          SELECT event, count() AS count
          FROM events
          WHERE toDate(timestamp + ${KST_OFFSET}) >= toDate(now() + ${KST_OFFSET}) - 59
            AND toDate(timestamp + ${KST_OFFSET}) <= toDate(now() + ${KST_OFFSET}) - 30
          AND ${pathFilter}
          GROUP BY event
        `,
			};
	}
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

// 연관 이벤트를 표시용 라벨로 매핑하고 가나다순(ko)으로 정렬
// period 변경 시 동일 이벤트가 항상 같은 위치에 오도록 고정 순서 보장
const sortRelatedEventsByLabel = (
	related: RelatedEvent[],
): LabeledRelatedEvent[] =>
	related
		.map((r) => ({ ...r, label: getEventLabel(r.event) }))
		.sort((a, b) => a.label.localeCompare(b.label, "ko"));

export {
	buildEmptyBreakdown,
	buildQueries,
	calcAverage,
	calcChangeRate,
	getPeakLabel,
	getYAxisTicks,
	sortRelatedEventsByLabel,
	toLabel,
};
