import type { PostHogQueryResult } from "@/entities/event/model/eventStats"
import { buildRetentionResponse } from "@/entities/event/model/retention"
import type { RetentionResponse } from "@/entities/event/model/retention"
import { KST_OFFSET, runHogQLQuery } from "@/shared/lib/posthogServer"

// KST 기준 이번 주 월요일 — toMonday() HogQL 함수와 동일한 기준으로 맞춤
const getKstMondayIso = (): string => {
	const kstMs = Date.now() + 9 * 60 * 60 * 1000
	const d = new Date(kstMs)
	const dow = d.getUTCDay() // 0=Sun, 1=Mon
	const daysToMonday = dow === 0 ? 6 : dow - 1
	const monday = new Date(kstMs - daysToMonday * 24 * 60 * 60 * 1000)
	const y = monday.getUTCFullYear()
	const m = String(monday.getUTCMonth() + 1).padStart(2, "0")
	const day = String(monday.getUTCDate()).padStart(2, "0")
	return `${y}-${m}-${day}`
}

const getRetentionServer = async (): Promise<RetentionResponse> => {
	// 84일(12주) 범위의 (person_id, 주차) 쌍을 가져온다.
	// 코호트 행렬 계산은 JS 순수 함수로 수행해 HogQL 쿼리를 단순하게 유지한다.
	const query = `
    SELECT
      person_id,
      toString(toMonday(timestamp + ${KST_OFFSET})) AS week_start
    FROM events
    WHERE toDate(timestamp + ${KST_OFFSET}) >= toDate(now() + ${KST_OFFSET}) - 83
    GROUP BY person_id, week_start
    ORDER BY week_start
  `

	const result: PostHogQueryResult = await runHogQLQuery(query)

	const rows = result.results.map((row) => {
		// HogQL 결과는 비타입 배열 — 쿼리 컬럼 순서 [person_id, week_start]로 지정했으므로 안전
		const [personId, weekStart] = row as [string, string]
		return { personId, weekStart }
	})

	const todayWeekStart = getKstMondayIso()
	const { cohorts, kpi } = buildRetentionResponse(rows, todayWeekStart)

	return { cohorts, kpi }
}

export { getRetentionServer }
