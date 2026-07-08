import type {
	LifecyclePeriod,
	LifecycleResponse,
} from "@/entities/event/model/lifecycle";
import {
	classifyLifecycle,
	LIFECYCLE_LOOKBACK_DAYS,
} from "@/entities/event/model/lifecycle";
import {
	buildPathFilter,
	EXTENDED_QUERY_TIMEOUT_MS,
	KST_OFFSET,
	runHogQLQuery,
} from "@/shared/lib/posthogServer";

const getLifecycleServer = async (
	period: LifecyclePeriod,
): Promise<LifecycleResponse> => {
	const pathFilter = buildPathFilter();
	const days = LIFECYCLE_LOOKBACK_DAYS[period];

	// GROUP BY로 날짜·사람 단위 집계 — 같은 날 여러 이벤트 발생 시 중복 제거
	const query = `
		SELECT
			toDate(timestamp + ${KST_OFFSET}) AS date,
			toString(person_id) AS person_id
		FROM events
		WHERE
			toDate(timestamp + ${KST_OFFSET}) >= toDate(now() + ${KST_OFFSET}) - ${days}
			AND ${pathFilter}
		GROUP BY date, person_id
		ORDER BY date ASC
	`;

	// TRACKED_PATHS에 "/"(최대 트래픽 경로)가 포함되어 있어 GROUP BY date, person_id 스캔이
	// 기본 10s를 넘을 수 있음 — getPathsKpiServer.ts와 동일하게 30s로 완화
	const result = await runHogQLQuery(query, EXTENDED_QUERY_TIMEOUT_MS);

	// HogQL results — 쿼리 컬럼 순서 [date, person_id]를 명시적으로 지정했으므로 안전
	const rows = result.results as [string, string][];

	return classifyLifecycle(rows, period);
};

export { getLifecycleServer };
