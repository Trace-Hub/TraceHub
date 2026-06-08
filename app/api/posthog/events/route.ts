import { NextResponse } from "next/server"
import type {
	EventPeriodCount,
	EventStats,
	EventStatsResponse,
	Period,
} from "@/entities/event/model/eventStats"
import {
	buildEmptyBreakdown,
	buildQueries,
	toLabel,
} from "@/entities/event/model/eventStatsUtils"
import { VALID_PERIODS, runHogQLQuery } from "@/shared/lib/posthogServer"

export async function GET(request: Request): Promise<NextResponse> {
	try {
		const { searchParams } = new URL(request.url)
		const rawPeriod = searchParams.get("period") ?? "day"

		if (!VALID_PERIODS.includes(rawPeriod as Period)) {
			return NextResponse.json(
				{ error: "유효하지 않은 period 값입니다. day | week | month 중 하나를 사용하세요." },
				{ status: 400 },
			)
		}

		const period = rawPeriod as Period
		const { current: currentQuery, previous: previousQuery } = buildQueries(period)

		const [current, previous] = await Promise.all([
			runHogQLQuery(currentQuery),
			runHogQLQuery(previousQuery),
		])

		const previousMap = new Map<string, number>()
		for (const row of previous.results) {
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