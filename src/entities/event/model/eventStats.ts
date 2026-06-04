import type { Period as PeriodTab } from "@/shared/ui/PeriodTab"

type Period = "day" | "week" | "month"

// 사용자에게 보이는 탭 라벨(오늘/7일/30일)을 API 파라미터(day/week/month)로 매핑
// 이벤트 목록·상세 페이지에서 동일하게 사용되므로 도메인 모델에 중앙화
const EVENT_TAB_TO_PERIOD: Record<PeriodTab, Period> = {
	오늘: "day",
	"7일": "week",
	"30일": "month",
} as const

export { EVENT_TAB_TO_PERIOD }

// PostHog HogQL 응답 중 사용하는 필드만
interface PostHogQueryResult {
	columns: string[]
	results: (string | number)[][]
	types: [string, string][]
}

interface EventPeriodCount {
	label: string // day: "14시", week/month: "05/19"
	count: number
}

interface EventStats {
	event: string
	currentTotal: number
	previousTotal: number // PostHog에 이전 기간 데이터가 없으면 0으로 처리
	breakdown: EventPeriodCount[]
}

interface EventStatsResponse {
	period: Period
	events: EventStats[]
}

// 상세 페이지 핵심 지표 — totalCount 외 uniqueUsers·sessionCount는 기존 EventStats에 없어 별도 타입으로 분리
// previous* 값은 이전 기간 쿼리와 함께 반환 — 각 카드의 변화율 계산에 사용
interface EventDetailMetrics {
	totalCount: number
	previousTotal: number
	uniqueUsers: number
	previousUniqueUsers: number
	sessionCount: number
	previousSessionCount: number
}

// AreaChart용 — 기존 EventPeriodCount(count만 있음)와 달리 total·unique 두 수치를 동시에 담아야 해서 분리
interface EventTrendPoint {
	label: string
	total: number
	unique: number
}

// 클라이언트는 읽기 쉬운 키만 알고, PostHog 실제 property 키($browser 등)로의 매핑은 API 라우트에서 처리
type EventPropertyType = "browser" | "os" | "current_url" | "prev_pageview"

interface EventPropertyValue {
	value: string
	count: number
	percentage: number
}

interface EventPropertyResponse {
	event: string
	property: EventPropertyType
	values: EventPropertyValue[]
}

// metrics + trend를 한 번에 반환 — 기간이 바뀌면 둘 다 함께 갱신되므로 하나의 응답으로 묶음
interface EventDetailResponse {
	event: string
	period: Period
	metrics: EventDetailMetrics
	trend: EventTrendPoint[]
}

// percentage = 이 이벤트 전체 세션 중 연관 이벤트가 함께 발생한 세션 비율 → 도넛 차트 비중
// sessionCount = 함께 발생한 세션의 수 (도넛 슬라이스 크기 기준)
// occurrenceCount = 연관 이벤트의 절대 발생 횟수 (막대 차트 X축 값)
interface RelatedEvent {
	event: string
	sessionCount: number
	occurrenceCount: number
	percentage: number
}

interface RelatedEventsResponse {
	event: string
	related: RelatedEvent[]
}

export type {
	Period,
	PostHogQueryResult,
	EventPeriodCount,
	EventStats,
	EventStatsResponse,
	EventDetailMetrics,
	EventTrendPoint,
	EventDetailResponse,
	EventPropertyType,
	EventPropertyValue,
	EventPropertyResponse,
	RelatedEvent,
	RelatedEventsResponse,
}
