import { NextResponse } from "next/server"
import type {
	EventPeriodCount,
	EventStats,
	EventStatsResponse,
	Period,
	PostHogQueryResult,
} from "@/entities/event/model/eventStats"
import {
	buildEmptyBreakdown,
	buildQueries,
	toLabel,
} from "@/entities/event/model/eventStatsUtils"

const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST
const POSTHOG_API_KEY = process.env.NEXT_POSTHOG_PERSONAL_API_KEY
const POSTHOG_PROJECT_ID = process.env.NEXT_POSTHOG_PROJECT_ID

if (!POSTHOG_HOST || !POSTHOG_API_KEY || !POSTHOG_PROJECT_ID) {
	throw new Error("PostHog 환경변수가 설정되지 않았습니다")
}

const VALID_PERIODS: Period[] = ["day", "week", "month"]

async function runHogQLQuery(query: string): Promise<PostHogQueryResult> {
	const response = await fetch(
		`${POSTHOG_HOST}/api/projects/${POSTHOG_PROJECT_ID}/query`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${POSTHOG_API_KEY}`,
			},
			body: JSON.stringify({ query: { kind: "HogQLQuery", query } }),
		},
	)

	if (!response.ok) {
		throw new Error(`PostHog API responded with ${response.status}`)
	}

	return response.json()
}

export async function GET(request: Request): Promise<NextResponse> {
	try {
		const { searchParams } = new URL(request.url)
		const rawPeriod = searchParams.get("period") ?? "day"

		// Period[] 타입의 includes()에 string을 넘기기 위해 as 필요
		if (!VALID_PERIODS.includes(rawPeriod as Period)) {
			return NextResponse.json(
				{ error: "유효하지 않은 period 값입니다. day | week | month 중 하나를 사용하세요." },
				{ status: 400 },
			)
		}

		// includes() 검증 완료 후 안전한 단언
		const period = rawPeriod as Period
		const { current: currentQuery, previous: previousQuery } = buildQueries(period)

		const [current, previous] = await Promise.all([
			runHogQLQuery(currentQuery),
			runHogQLQuery(previousQuery),
		])

		const previousMap = new Map<string, number>()
		for (const row of previous.results) {
			// 쿼리 컬럼 순서 [event, count]를 명시적으로 지정했으므로 안전
			const [event, count] = row as [string, number]
			previousMap.set(event, Number(count))
		}

		const eventMap = new Map<string, EventPeriodCount[]>()
		for (const row of current.results) {
			// 쿼리 컬럼 순서 [event, unit, count]를 명시적으로 지정했으므로 안전
			const [event, unit, count] = row as [string, string | number, number]
			if (!eventMap.has(event)) {
				eventMap.set(event, buildEmptyBreakdown(period))
			}

			// has() 검증 완료 후 안전한 단언
			const breakdown = eventMap.get(event) as EventPeriodCount[]
			const label = toLabel(unit, period)
			const slot = breakdown.find((b) => b.label === label)
			if (slot) {
				slot.count = Number(count)
			}
		}

		const events: EventStats[] = Array.from(eventMap.entries()).map(
			([event, breakdown]) => ({
				event,
				currentTotal: breakdown.reduce((sum, b) => sum + b.count, 0),
				previousTotal: previousMap.get(event) ?? 0,
				breakdown,
			}),
		)

		return NextResponse.json({ period, events } satisfies EventStatsResponse)
	} catch (error) {
		console.error("PostHog Query API error:", error)
		return NextResponse.json(
			{ error: "이벤트 데이터를 불러오는 데 실패했습니다" },
			{ status: 500 },
		)
	}
}