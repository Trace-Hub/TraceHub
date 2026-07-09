import type { Period as PeriodTab } from "@/shared/ui/PeriodTab";

type Period = "day" | "week" | "month";

// 사용자에게 보이는 탭 라벨(오늘/7일/30일)을 API 파라미터(day/week/month)로 매핑
// 이벤트 목록·상세 페이지에서 동일하게 사용되므로 도메인 모델에 중앙화
const EVENT_TAB_TO_PERIOD: Record<PeriodTab, Period> = {
	오늘: "day",
	"7일": "week",
	"30일": "month",
} as const;

// PostHog HogQL 반영 지연(실측 약 5분) — refetchInterval과 카운트다운이 동일 값을 참조하도록 단일 상수로 관리
const EVENT_STATS_REFETCH_INTERVAL_MS = 5 * 60 * 1000;

// EVENT_TAB_TO_PERIOD의 역방향 — URL 파라미터(day/week/month)를 TabPeriod로 복원할 때 사용
const PERIOD_TO_TAB: Record<Period, PeriodTab> = {
	day: "오늘",
	week: "7일",
	month: "30일",
} as const;

export { EVENT_STATS_REFETCH_INTERVAL_MS, EVENT_TAB_TO_PERIOD, PERIOD_TO_TAB };

// PostHog HogQL 응답 중 사용하는 필드만
interface PostHogQueryResult {
	columns: string[];
	results: (string | number)[][];
	types: [string, string][];
}

interface EventPeriodCount {
	label: string; // day: "14시", week/month: "05/19"
	count: number;
}

interface EventStats {
	event: string;
	currentTotal: number;
	previousTotal: number; // PostHog에 이전 기간 데이터가 없으면 0으로 처리
	breakdown: EventPeriodCount[];
}

interface EventStatsResponse {
	period: Period;
	events: EventStats[];
}

// 상세 페이지 핵심 지표 — totalCount 외 uniqueUsers·sessionCount는 기존 EventStats에 없어 별도 타입으로 분리
// previous* 값은 이전 기간 쿼리와 함께 반환 — 각 카드의 변화율 계산에 사용
interface EventDetailMetrics {
	totalCount: number;
	previousTotal: number;
	uniqueUsers: number;
	previousUniqueUsers: number;
	sessionCount: number;
	previousSessionCount: number;
}

// AreaChart용 — 기존 EventPeriodCount(count만 있음)와 달리 total·unique 두 수치를 동시에 담아야 해서 분리
interface EventTrendPoint {
	label: string;
	total: number;
	unique: number;
}

// 클라이언트는 읽기 쉬운 키만 알고, PostHog 실제 property 키($browser 등)로의 매핑은 API 라우트에서 처리
type EventPropertyType = "browser" | "os" | "current_url" | "prev_pageview";

interface EventPropertyValue {
	value: string;
	count: number;
	percentage: number;
}

interface EventPropertyResponse {
	event: string;
	property: EventPropertyType;
	values: EventPropertyValue[];
}

// metrics + trend를 한 번에 반환 — 기간이 바뀌면 둘 다 함께 갱신되므로 하나의 응답으로 묶음
interface EventDetailResponse {
	event: string;
	period: Period;
	metrics: EventDetailMetrics;
	trend: EventTrendPoint[];
}

// 이벤트가 발생한 페이지별 통계 — 드롭다운 + 기본 차트에 사용
// count = 해당 페이지에서의 이벤트 발생 횟수
// sessionCount = 해당 페이지에서의 유니크 세션 수
// percentage = 전체 발생 대비 이 페이지의 비율
interface EventPageStat {
	pathname: string;
	count: number;
	sessionCount: number;
	percentage: number;
}

interface EventPagesResponse {
	event: string;
	pages: EventPageStat[];
}

// 특정 페이지에서 발생한 이벤트 분포 — 페이지 선택 시 차트에 사용
interface PageEventItem {
	event: string;
	count: number;
	percentage: number;
}

interface PageEventDistributionResponse {
	pathname: string;
	events: PageEventItem[];
}

// KPI 대시보드 기간별 데이터 포인트 — 시간(오늘)·일자(7일) breakdown에 공통 사용
interface KpiBreakdownPoint {
	label: string;
	activeUsers: number;
	totalEvents: number;
}

// 오늘·7일 각 기간의 집계 결과 묶음
interface EventKpiPeriod {
	activeUsers: number;
	totalEvents: number;
	previousActiveUsers: number;
	previousTotalEvents: number;
	breakdown: KpiBreakdownPoint[];
}

interface EventKpiResponse {
	today: EventKpiPeriod;
	week: EventKpiPeriod;
}

export type {
	EventDetailMetrics,
	EventDetailResponse,
	EventKpiPeriod,
	EventKpiResponse,
	EventPageStat,
	EventPagesResponse,
	EventPeriodCount,
	EventPropertyResponse,
	EventPropertyType,
	EventPropertyValue,
	EventStats,
	EventStatsResponse,
	EventTrendPoint,
	KpiBreakdownPoint,
	PageEventDistributionResponse,
	PageEventItem,
	Period,
	PostHogQueryResult,
};
