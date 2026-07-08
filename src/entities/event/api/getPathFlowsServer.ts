import type { Period, PostHogQueryResult } from "@/entities/event/model/eventStats"
import type { PathFlowsResponse, PathStepCount, PathVisitRow } from "@/entities/event/model/paths"
import { PATH_PERIOD_TO_DAYS, buildPathFlows } from "@/entities/event/model/paths"
import {
	buildPathFilter,
	EXTENDED_QUERY_TIMEOUT_MS,
	runHogQLQuery,
} from "@/shared/lib/posthogServer"

const getPathFlowsServer = async (
	startPath: string | null,
	period: Period,
	stepCount: PathStepCount,
): Promise<PathFlowsResponse> => {
	// 정확한 KST 일자 경계가 필요 없는 단순 rolling window라 toDate()는 쓰지 않는다 —
	// properties.$pathname처럼 nullable 컬럼을 SELECT와 함께 쓰면 HogQL이 toDate를 toDateOrNull로
	// 치환하면서 DateTime64 인자를 거부하는 오류가 있어 이를 피한다 (getPathsKpiServer와 동일 이슈)
	const days = PATH_PERIOD_TO_DAYS[period]
	const lookbackFilter = `timestamp >= now() - INTERVAL ${days} DAY`

	// startPath가 있으면 그 경로를 한 번이라도 방문한 person으로 좁히고, null("전체 경로")이면
	// TRACKED_PATHS 전체 방문자를 대상으로 한다 — 이 경우 사용자별 실제 첫 방문 페이지가 Step 0이 된다
	// (Average time 계산을 위해 날짜가 아닌 원본 timestamp를 그대로 SELECT)
	// SELECT 별칭을 "timestamp"로 두면 WHERE의 timestamp가 실제 컬럼 대신
	// toString()으로 변환된 별칭(String)을 가리켜 타입 에러가 나므로 별도 이름을 쓴다
	const personScopeFilter =
		startPath !== null
			? `AND person_id IN (
					SELECT DISTINCT person_id
					FROM events
					WHERE event = '$pageview' AND ${buildPathFilter(startPath)} AND ${lookbackFilter}
				)`
			: ""

	// 여정은 person이 아니라 session 단위로 묶는다 — person 단위로 묶으면 "Step 0"이 그 사람이
	// 조회 기간(7/30일) 전체에서 처음 찍힌 단 하나의 페이지로 고정되어, 그 사람의 다른 세션들이
	// 각자 어디서 시작됐는지는 전혀 반영되지 않는다(예: /sentry-test가 실제로는 흔한 세션
	// 시작점이어도, 그 사람의 조회 기간 통틀어 첫 방문이 아니라는 이유만으로 전체 경로 모드에서
	// 전혀 나타나지 않는 문제가 있었다). getPathsKpiServer.ts와 동일하게 session_id로 묶는다.
	const query = `
		SELECT
			toString(properties.$session_id) AS session_id,
			properties.$pathname AS path,
			toString(timestamp) AS visited_at
		FROM events
		WHERE
			event = '$pageview'
			AND ${buildPathFilter()}
			AND ${lookbackFilter}
			${personScopeFilter}
		ORDER BY session_id, visited_at
		LIMIT 50000
	`

	const result: PostHogQueryResult = await runHogQLQuery(query, EXTENDED_QUERY_TIMEOUT_MS)

	const rows: PathVisitRow[] = result.results.map((row) => {
		// HogQL 결과는 비타입 배열 — 쿼리 컬럼 순서 [session_id, path, visited_at]로 지정했으므로 안전
		const [sessionId, path, timestamp] = row as [string, string, string]
		return { sessionId, path, timestamp }
	})

	return buildPathFlows(rows, startPath, stepCount)
}

export { getPathFlowsServer }
