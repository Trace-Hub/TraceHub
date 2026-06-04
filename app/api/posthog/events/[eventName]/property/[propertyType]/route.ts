import { NextResponse } from "next/server"
import type {
	EventPropertyResponse,
	EventPropertyType,
	EventPropertyValue,
} from "@/entities/event/model/eventStats"
import { runHogQLQuery } from "@/shared/lib/posthogServer"

const VALID_PROPERTY_TYPES: EventPropertyType[] = [
	"browser",
	"os",
	"current_url",
	"prev_pageview",
]

// 클라이언트 키 → PostHog 실제 property 키 매핑
// prev_pageview만 pathname으로 한정해서 URL 전체 대신 경로만 집계
const PROPERTY_KEY_MAP: Record<EventPropertyType, string> = {
	browser: "properties.$browser",
	os: "properties.$os",
	current_url: "properties.$current_url",
	prev_pageview: "properties.$prev_pageview_pathname",
}

// current_url만 전체 URL(호스트 포함)을 가짐 — 환경별로 localhost 데이터를 분리
// dev: localhost 이벤트만, production: localhost 제외
const buildHostFilter = (propertyType: EventPropertyType): string => {
	if (propertyType !== "current_url") return ""
	return process.env.NODE_ENV === "development"
		? "AND properties.$current_url LIKE '%localhost%'"
		: "AND properties.$current_url NOT LIKE '%localhost%'"
}

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ eventName: string; propertyType: string }> },
): Promise<NextResponse> {
	try {
		const { eventName: rawEventName, propertyType: rawPropertyType } = await params
		const eventName = decodeURIComponent(rawEventName)

		// EventPropertyType[] 타입의 includes()에 string을 넘기기 위해 as 필요
		if (!VALID_PROPERTY_TYPES.includes(rawPropertyType as EventPropertyType)) {
			return NextResponse.json(
				{
					error: `유효하지 않은 propertyType입니다. ${VALID_PROPERTY_TYPES.join(" | ")} 중 하나를 사용하세요.`,
				},
				{ status: 400 },
			)
		}

		// includes() 검증 완료 후 안전한 단언
		const propertyType = rawPropertyType as EventPropertyType
		const propertyKey = PROPERTY_KEY_MAP[propertyType]

		const hostFilter = buildHostFilter(propertyType)

		const result = await runHogQLQuery(`
			SELECT ${propertyKey}, count() AS count
			FROM events
			WHERE event = '${eventName}'
			AND ${propertyKey} IS NOT NULL
			AND ${propertyKey} != ''
			${hostFilter}
			GROUP BY 1
			ORDER BY 2 DESC
			LIMIT 10
		`)

		// 전체 합계를 구해 percentage 계산 — Sentry tags 라우트와 동일한 방식
		const total = result.results.reduce((sum, row) => {
			const count = row[1]
			return sum + (typeof count === "number" ? count : 0)
		}, 0)

		const values: EventPropertyValue[] = result.results.map((row) => {
			// 쿼리 컬럼 순서 [propertyValue, count]를 명시적으로 지정했으므로 안전
			const [value, count] = row as [string, number]
			return {
				value: String(value),
				count: Number(count),
				percentage: total > 0 ? Number(((Number(count) / total) * 100).toFixed(1)) : 0,
			}
		})

		return NextResponse.json({
			event: eventName,
			property: propertyType,
			values,
		} satisfies EventPropertyResponse)
	} catch (error) {
		console.error("PostHog Property API error:", error)
		return NextResponse.json(
			{ error: "속성 분포 데이터를 불러오는 데 실패했습니다" },
			{ status: 500 },
		)
	}
}
