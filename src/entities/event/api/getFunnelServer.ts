import type { PostHogQueryResult } from "@/entities/event/model/eventStats";
import type {
	FunnelPeriod,
	FunnelRawRow,
	FunnelResponse,
} from "@/entities/event/model/funnel";
import {
	buildFunnelResponse,
	buildKstDateRange,
	FUNNEL_LOOKBACK_DAYS,
} from "@/entities/event/model/funnel";
import { getFunnelById } from "@/shared/config/funnelConfig";
import {
	EXTENDED_QUERY_TIMEOUT_MS,
	KST_OFFSET,
	runHogQLQuery,
	sanitizeHogQLString,
} from "@/shared/lib/posthogServer";

const getFunnelServer = async (
	funnelId: string,
	period: FunnelPeriod,
): Promise<FunnelResponse> => {
	const funnelConfig = getFunnelById(funnelId);
	if (!funnelConfig) {
		throw new Error(
			`funnelConfig에 "${funnelId}" 퍼널이 정의되어 있지 않습니다`,
		);
	}

	const { steps } = funnelConfig;
	const days = FUNNEL_LOOKBACK_DAYS[period];
	const dateRange = buildKstDateRange(days);
	const eventList = steps.map((s) => `'${sanitizeHogQLString(s.event)}'`).join(", ");

	const query = `
		SELECT
			toString(person_id) AS person_id,
			event,
			toDate(timestamp + ${KST_OFFSET}) AS date
		FROM events
		WHERE
			event IN (${eventList})
			AND toDate(timestamp + ${KST_OFFSET}) >= toDate(now() + ${KST_OFFSET}) - ${days - 1}
		ORDER BY person_id, timestamp
		LIMIT 50000
	`;

	// 30일 쿼리는 최대 50000행을 반환하므로 기본 10s보다 긴 타임아웃 필요
	const result: PostHogQueryResult = await runHogQLQuery(
		query,
		EXTENDED_QUERY_TIMEOUT_MS,
	);

	const rows: FunnelRawRow[] = result.results.map((row) => {
		const [personId, event, date] = row as [string, string, string];
		return { personId, event, date };
	});

	return buildFunnelResponse(rows, dateRange, steps);
};

export { getFunnelServer };
