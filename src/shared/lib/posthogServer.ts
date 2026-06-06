import type {
	Period,
	PostHogQueryResult,
} from "@/entities/event/model/eventStats"

// NEXT_POSTHOG_PERSONAL_API_KEY 는 NEXT_PUBLIC_ 접두사가 없어 클라이언트 번들에서 undefined → throw.
// 따라서 본 모듈은 사실상 server-only 로 동작한다.

const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST
const POSTHOG_API_KEY = process.env.NEXT_POSTHOG_PERSONAL_API_KEY
const POSTHOG_PROJECT_ID = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_ID

if (!POSTHOG_HOST || !POSTHOG_API_KEY || !POSTHOG_PROJECT_ID) {
	throw new Error("PostHog 환경변수가 설정되지 않았습니다")
}

// HogQL 은 toTimezone() 함수를 미지원하므로 INTERVAL 산술로 KST(UTC+9) 오프셋 적용
const KST_OFFSET = "INTERVAL 9 HOUR"

// HogQL 문자열 리터럴 내 단일 따옴표를 이스케이프 — 특수문자 포함 이벤트명의 쿼리 파싱 오류 방지
const sanitizeHogQLString = (value: string): string => value.replace(/'/g, "\\'")

const VALID_PERIODS: Period[] = ["day", "week", "month"]

const buildKstPeriodFilter = (period: Period): string => {
	switch (period) {
		case "day":
			return `toDate(timestamp + ${KST_OFFSET}) = toDate(now() + ${KST_OFFSET})`
		case "week":
			return `toDate(timestamp + ${KST_OFFSET}) >= toDate(now() + ${KST_OFFSET}) - 6`
		case "month":
			return `toDate(timestamp + ${KST_OFFSET}) >= toDate(now() + ${KST_OFFSET}) - 29`
	}
}

const buildKstPreviousPeriodFilter = (period: Period): string => {
	switch (period) {
		case "day":
			return `toDate(timestamp + ${KST_OFFSET}) = toDate(now() + ${KST_OFFSET}) - 1`
		case "week":
			return `toDate(timestamp + ${KST_OFFSET}) >= toDate(now() + ${KST_OFFSET}) - 13 AND toDate(timestamp + ${KST_OFFSET}) <= toDate(now() + ${KST_OFFSET}) - 7`
		case "month":
			return `toDate(timestamp + ${KST_OFFSET}) >= toDate(now() + ${KST_OFFSET}) - 59 AND toDate(timestamp + ${KST_OFFSET}) <= toDate(now() + ${KST_OFFSET}) - 30`
	}
}

const runHogQLQuery = async (query: string): Promise<PostHogQueryResult> => {
	const response = await fetch(
		`${POSTHOG_HOST}/api/projects/${POSTHOG_PROJECT_ID}/query`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${POSTHOG_API_KEY}`,
			},
			body: JSON.stringify({ query: { kind: "HogQLQuery", query } }),
			signal: AbortSignal.timeout(10_000),
		},
	)
	if (!response.ok) {
		const body = await response.text()
		throw new Error(`PostHog API ${response.status}: ${body}`)
	}
	return response.json()
}

export {
	KST_OFFSET,
	VALID_PERIODS,
	buildKstPeriodFilter,
	buildKstPreviousPeriodFilter,
	runHogQLQuery,
	sanitizeHogQLString,
}