import type { Period, PostHogQueryResult } from "@/entities/event/model/eventStats"
import type { PathsKpiResponse, PathVisitRow } from "@/entities/event/model/paths"
import { PATH_PERIOD_TO_DAYS, buildPathsKpi } from "@/entities/event/model/paths"
import { buildPathFilter, runHogQLQuery } from "@/shared/lib/posthogServer"

const getPathsKpiServer = async (period: Period): Promise<PathsKpiResponse> => {
	// TRACKED_PATHS 전체 대상, 세션별 첫/마지막 방문 판별을 위해 person_id가 아닌 session_id로 묶는다
	// 정확한 KST 일자 경계가 필요 없는 단순 rolling window라 toDate()는 쓰지 않는다 —
	// properties.$session_id/$pathname처럼 nullable 컬럼을 SELECT와 함께 쓰면 HogQL이 toDate를
	// toDateOrNull로 치환하면서 DateTime64 인자를 거부하는 오류가 있어 이를 피한다
	// SELECT 별칭을 "timestamp"로 두면 WHERE의 timestamp가 실제 컬럼 대신
	// toString()으로 변환된 별칭(String)을 가리켜 타입 에러가 나므로 별도 이름을 쓴다
	const days = PATH_PERIOD_TO_DAYS[period]
	const query = `
		SELECT
			toString(properties.$session_id) AS session_id,
			properties.$pathname AS path,
			toString(timestamp) AS visited_at
		FROM events
		WHERE
			event = '$pageview'
			AND ${buildPathFilter()}
			AND timestamp >= now() - INTERVAL ${days} DAY
		ORDER BY session_id, visited_at
		LIMIT 50000
	`

	const result: PostHogQueryResult = await runHogQLQuery(query, 30_000)

	const rows: PathVisitRow[] = result.results.map((row) => {
		// HogQL 결과는 비타입 배열 — 쿼리 컬럼 순서 [session_id, path, visited_at]로 지정했으므로 안전
		const [sessionId, path, timestamp] = row as [string, string, string]
		return { sessionId, path, timestamp }
	})

	return buildPathsKpi(rows)
}

export { getPathsKpiServer }
