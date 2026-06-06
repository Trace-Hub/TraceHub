import { NextResponse } from "next/server"
import type {
	Period,
	RelatedEvent,
	RelatedEventsResponse,
} from "@/entities/event/model/eventStats"
import {
	VALID_PERIODS,
	buildKstPeriodFilter,
	runHogQLQuery,
	sanitizeHogQLString,
} from "@/shared/lib/posthogServer"

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ eventName: string }> },
): Promise<NextResponse> {
	try {
		const { eventName: rawEventName } = await params
		const eventName = sanitizeHogQLString(decodeURIComponent(rawEventName))

		const { searchParams } = new URL(request.url)
		const rawPeriod = searchParams.get("period") ?? "day"

		// Period[] 타입의 includes()에 string을 넘기기 위해 as 필요
		if (!VALID_PERIODS.includes(rawPeriod as Period)) {
			return NextResponse.json(
				{
					error: "유효하지 않은 period 값입니다. day | week | month 중 하나를 사용하세요.",
				},
				{ status: 400 },
			)
		}

		// includes() 검증 완료 후 안전한 단언
		const period = rawPeriod as Period
		const periodFilter = buildKstPeriodFilter(period)

		// 총 세션 수(분모)와 연관 이벤트(분자)를 병렬로 조회
		// 두 쿼리 모두 period 필터를 적용해 시간대별 추이와 동기화
		const [totalResult, relatedResult] = await Promise.all([
			runHogQLQuery(`
				SELECT countDistinct(properties.$session_id)
				FROM events
				WHERE event = '${eventName}'
				AND properties.$session_id IS NOT NULL
				AND ${periodFilter}
			`),
			runHogQLQuery(`
				SELECT
					event,
					countDistinct(properties.$session_id) AS session_count,
					count() AS occurrence_count
				FROM events
				WHERE properties.$session_id IN (
					SELECT properties.$session_id
					FROM events
					WHERE event = '${eventName}'
					AND properties.$session_id IS NOT NULL
					AND ${periodFilter}
				)
				AND event != '${eventName}'
				AND properties.$session_id IS NOT NULL
				AND ${periodFilter}
				GROUP BY event
				ORDER BY session_count DESC
				LIMIT 5
			`),
		])

		// 단일 집계값 — results[0][0]이 없으면 0으로 처리
		const totalSessions = Number(totalResult.results[0]?.[0] ?? 0)

		// 총 세션이 0이면 연관 이벤트 의미 없음 → 빈 배열 반환
		if (totalSessions === 0) {
			return NextResponse.json({
				event: eventName,
				related: [],
			} satisfies RelatedEventsResponse)
		}

		const related: RelatedEvent[] = relatedResult.results.map((row) => {
			// 쿼리 컬럼 순서 [event, session_count, occurrence_count]를 명시적으로 지정했으므로 안전
			const [event, sessionCount, occurrenceCount] = row as [string, number, number]
			return {
				event: String(event),
				sessionCount: Number(sessionCount),
				occurrenceCount: Number(occurrenceCount),
				// 이 이벤트가 발생한 전체 세션 중 연관 이벤트가 함께 발생한 비율
				percentage: Number(((Number(sessionCount) / totalSessions) * 100).toFixed(1)),
			}
		})

		return NextResponse.json({
			event: eventName,
			related,
		} satisfies RelatedEventsResponse)
	} catch (error) {
		console.error("PostHog Related Events API error:", error)
		return NextResponse.json(
			{ error: "연관 이벤트 데이터를 불러오는 데 실패했습니다" },
			{ status: 500 },
		)
	}
}
