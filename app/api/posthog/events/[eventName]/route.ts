import { NextResponse } from "next/server"
import type {
	EventDetailMetrics,
	EventTrendPoint,
	Period,
} from "@/entities/event/model/eventStats"
import { buildEmptyBreakdown, toLabel } from "@/entities/event/model/eventStatsUtils"
import {
	KST_OFFSET,
	VALID_PERIODS,
	buildKstPeriodFilter,
	buildKstPreviousPeriodFilter,
	runHogQLQuery,
	sanitizeHogQLString,
} from "@/shared/lib/posthogServer"

interface EventDetailResponse {
	event: string
	period: Period
	metrics: EventDetailMetrics
	trend: EventTrendPoint[]
}

// period별 시간 단위 집계 컬럼 — day는 KST 시간별, week/month는 KST 날짜별
// (period 필터와 달리 KST_OFFSET 산식을 그대로 노출해야 해서 라우트에 남김)
const buildTrendUnit = (period: Period): string => {
	return period === "day"
		? `toHour(timestamp + ${KST_OFFSET})`
		: `toDate(timestamp + ${KST_OFFSET})`
}

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ eventName: string }> },
): Promise<NextResponse> {
	try {
		const { eventName: rawEventName } = await params
		// URL 인코딩된 $pageview 같은 이벤트명 복원
		const eventName = sanitizeHogQLString(decodeURIComponent(rawEventName))

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
		const periodFilter = buildKstPeriodFilter(period)
		const trendUnit = buildTrendUnit(period)

		const previousPeriodFilter = buildKstPreviousPeriodFilter(period)

		// 세 쿼리를 병렬 실행 — metrics·previous·trend 모두 같은 eventName 대상
		const [metricsResult, previousResult, trendResult] = await Promise.all([
			runHogQLQuery(`
				SELECT
					count() AS totalCount,
					countDistinct(distinct_id) AS uniqueUsers,
					countDistinct(properties.$session_id) AS sessionCount
				FROM events
				WHERE event = '${eventName}'
				AND ${periodFilter}
			`),
			runHogQLQuery(`
				SELECT
					count() AS previousTotal,
					countDistinct(distinct_id) AS previousUniqueUsers,
					countDistinct(properties.$session_id) AS previousSessionCount
				FROM events
				WHERE event = '${eventName}'
				AND ${previousPeriodFilter}
			`),
			runHogQLQuery(`
				SELECT ${trendUnit} AS unit, count(), countDistinct(distinct_id)
				FROM events
				WHERE event = '${eventName}'
				AND ${periodFilter}
				GROUP BY unit
				ORDER BY unit ASC
			`),
		])

		// 메트릭 — 단일 행 응답, 컬럼 순서 [totalCount, uniqueUsers, sessionCount]
		const [totalCount, uniqueUsers, sessionCount] = (metricsResult.results[0] ?? [0, 0, 0]) as [number, number, number]
		// 이전 기간 — 컬럼 순서 [previousTotal, previousUniqueUsers, previousSessionCount]
		const [previousTotal, previousUniqueUsers, previousSessionCount] = (previousResult.results[0] ?? [0, 0, 0]) as [number, number, number]
		const metrics: EventDetailMetrics = {
			totalCount: Number(totalCount),
			previousTotal: Number(previousTotal),
			uniqueUsers: Number(uniqueUsers),
			previousUniqueUsers: Number(previousUniqueUsers),
			sessionCount: Number(sessionCount),
			previousSessionCount: Number(previousSessionCount),
		}

		// 트렌드 — 빈 슬롯을 먼저 만들고 실제 데이터로 채움
		// buildEmptyBreakdown 재사용으로 기존 목록 페이지와 동일한 시간 슬롯 구조 유지
		const emptySlots = buildEmptyBreakdown(period)
		const trend: EventTrendPoint[] = emptySlots.map((slot) => ({
			label: slot.label,
			total: 0,
			unique: 0,
		}))

		for (const row of trendResult.results) {
			// 쿼리 컬럼 순서 [unit, total, unique]를 명시적으로 지정했으므로 안전
			const [unit, total, unique] = row as [string | number, number, number]
			const label = toLabel(unit, period)
			const slot = trend.find((t) => t.label === label)
			if (slot) {
				slot.total = Number(total)
				slot.unique = Number(unique)
			}
		}

		return NextResponse.json({
			event: eventName,
			period,
			metrics,
			trend,
		} satisfies EventDetailResponse)
	} catch (error) {
		console.error("PostHog Event Detail API error:", error)
		return NextResponse.json(
			{ error: "이벤트 상세 데이터를 불러오는 데 실패했습니다" },
			{ status: 500 },
		)
	}
}
