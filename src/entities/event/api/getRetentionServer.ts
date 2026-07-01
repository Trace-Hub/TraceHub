import type { PostHogQueryResult } from "@/entities/event/model/eventStats"
import { buildRetentionResponse } from "@/entities/event/model/retention"
import type { RetentionResponse } from "@/entities/event/model/retention"
import dayjs from "@/shared/lib/dayjs"
import { KST_OFFSET, runHogQLQuery } from "@/shared/lib/posthogServer"

// KST 기준 이번 주 월요일 — HogQL toMonday()와 동일한 ISO week(월요일 시작) 기준
const getKstMondayIso = (): string => {
	const now = dayjs().tz("Asia/Seoul")
	// day() 0=Sun → 6일 전 월요일, 1~6 → (dow-1)일 전 월요일
	const daysToMonday = now.day() === 0 ? 6 : now.day() - 1
	return now.subtract(daysToMonday, "day").format("YYYY-MM-DD")
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
