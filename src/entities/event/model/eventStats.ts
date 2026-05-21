type Period = "day" | "week" | "month"

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

export type { Period, PostHogQueryResult, EventPeriodCount, EventStats, EventStatsResponse }
