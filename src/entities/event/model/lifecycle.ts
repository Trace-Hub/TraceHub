import dayjs from "@/shared/lib/dayjs";

type LifecyclePeriod = "week" | "month";

type LifecycleTab = "7일" | "30일";

type LifecycleSegmentKey =
	| "new"
	| "evaluating"
	| "engaged"
	| "bounced"
	| "lapsing"
	| "disappearing";

interface LifecycleSegmentData {
	key: LifecycleSegmentKey;
	count: number;
	percentage: number; // count / totalCount * 100
}

interface LifecycleResponse {
	period: LifecyclePeriod;
	activeCount: number; // 현재 활성 윈도우(7일/30일) 내 유니크 사용자 수
	previousActiveCount: number; // 직전 동일 윈도우 내 활성 사용자 수 (증감 비교용)
	totalCount: number; // 전체 룩백 기간 유니크 사용자 수
	segments: LifecycleSegmentData[];
	lastUpdated: string; // ISO timestamp
}

const LIFECYCLE_TAB_TO_PERIOD: Record<LifecycleTab, LifecyclePeriod> = {
	"7일": "week",
	"30일": "month",
} as const;

const VALID_LIFECYCLE_PERIODS: LifecyclePeriod[] = ["week", "month"];

// HogQL 조회 범위 — active window + tier1 + tier2 전부 커버
const LIFECYCLE_LOOKBACK_DAYS: Record<LifecyclePeriod, number> = {
	week: 60, // 7일 active + 23일 tier1 + 30일 tier2
	month: 90, // 30일 active + 30일 tier1 + 30일 tier2
};

// "활성" 기준 일수
const LIFECYCLE_ACTIVE_WINDOW: Record<LifecyclePeriod, number> = {
	week: 7,
	month: 30,
};

// Tier-1 비활성 상한 (마지막 활성으로부터 경과 일수)
// week: 8–30일, month: 31–60일
const LIFECYCLE_TIER1_END: Record<LifecyclePeriod, number> = {
	week: 30,
	month: 60,
};

// Tier-2 비활성 상한 (Disappearing)
// week: 31–60일, month: 61–90일
const LIFECYCLE_TIER2_END: Record<LifecyclePeriod, number> = {
	week: 60,
	month: 90,
};

const LIFECYCLE_SEGMENT_KEYS: LifecycleSegmentKey[] = [
	"new",
	"evaluating",
	"engaged",
	"bounced",
	"lapsing",
	"disappearing",
];

// rows: HogQL 결과 [(date "YYYY-MM-DD", person_id), ...]
const classifyLifecycle = (
	rows: [string, string][],
	period: LifecyclePeriod,
): LifecycleResponse => {
	const activeWindow = LIFECYCLE_ACTIVE_WINDOW[period];
	const tier1End = LIFECYCLE_TIER1_END[period];
	const tier2End = LIFECYCLE_TIER2_END[period];
	const today = dayjs();

	const emptySegments: LifecycleSegmentData[] = LIFECYCLE_SEGMENT_KEYS.map(
		(key) => ({ key, count: 0, percentage: 0 }),
	);

	if (rows.length === 0) {
		return {
			period,
			activeCount: 0,
			previousActiveCount: 0,
			totalCount: 0,
			segments: emptySegments,
			lastUpdated: new Date().toISOString(),
		};
	}

	// person_id → 활동 날짜 Set 구성
	const personDatesMap = new Map<string, Set<string>>();
	for (const [date, personId] of rows) {
		if (!personDatesMap.has(personId)) {
			personDatesMap.set(personId, new Set());
		}
		(personDatesMap.get(personId) as Set<string>).add(date);
	}

	const counts: Record<LifecycleSegmentKey, number> = {
		new: 0,
		evaluating: 0,
		engaged: 0,
		bounced: 0,
		lapsing: 0,
		disappearing: 0,
	};

	let activeCount = 0;
	let previousActiveCount = 0;

	const prevWindowStart = activeWindow + 1;
	const prevWindowEnd = activeWindow * 2;

	for (const [, dates] of personDatesMap) {
		const sortedDates = [...dates].sort();
		const lastActive = sortedDates[sortedDates.length - 1];
		const daysSinceLast = today.diff(dayjs(lastActive), "day");

		// 직전 동일 윈도우(비교 기준) 내 활성 여부
		const wasActiveInPrevWindow = sortedDates.some((d) => {
			const daysAgo = today.diff(dayjs(d), "day");
			return daysAgo >= prevWindowStart && daysAgo <= prevWindowEnd;
		});
		if (wasActiveInPrevWindow) previousActiveCount++;

		if (daysSinceLast <= activeWindow) {
			// 활성 사용자 — 현재 윈도우 내 방문 횟수로 세분화
			activeCount++;
			const visitCount = sortedDates.filter(
				(d) => today.diff(dayjs(d), "day") <= activeWindow,
			).length;

			if (visitCount === 1) counts.new++;
			else if (visitCount <= 3) counts.evaluating++;
			else counts.engaged++;
		} else if (daysSinceLast <= tier1End) {
			// Tier-1 비활성: 전체 방문 횟수로 Bounced vs Lapsing 구분
			const totalVisits = dates.size;
			if (totalVisits === 1) counts.bounced++;
			else counts.lapsing++;
		} else if (daysSinceLast <= tier2End) {
			counts.disappearing++;
		}
		// tier2End 초과 — 룩백 범위 밖이므로 분류 제외
	}

	const totalCount = personDatesMap.size;
	const safeTotal = totalCount === 0 ? 1 : totalCount;

	return {
		period,
		activeCount,
		previousActiveCount,
		totalCount,
		segments: LIFECYCLE_SEGMENT_KEYS.map((key) => ({
			key,
			count: counts[key],
			percentage: (counts[key] / safeTotal) * 100,
		})),
		lastUpdated: new Date().toISOString(),
	};
};

export type {
	LifecyclePeriod,
	LifecycleResponse,
	LifecycleSegmentData,
	LifecycleSegmentKey,
	LifecycleTab,
};
export {
	classifyLifecycle,
	LIFECYCLE_ACTIVE_WINDOW,
	LIFECYCLE_LOOKBACK_DAYS,
	LIFECYCLE_TAB_TO_PERIOD,
	LIFECYCLE_TIER1_END,
	LIFECYCLE_TIER2_END,
	VALID_LIFECYCLE_PERIODS,
};
