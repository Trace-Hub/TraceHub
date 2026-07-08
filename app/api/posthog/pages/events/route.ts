import { NextResponse } from "next/server";
import type {
	PageEventDistributionResponse,
	PageEventItem,
} from "@/entities/event/model/eventStats";
import {
	buildKstPeriodFilter,
	buildPathFilter,
	EXTENDED_QUERY_TIMEOUT_MS,
	INVALID_PERIOD_ERROR_MESSAGE,
	parsePeriodParam,
	runHogQLQuery,
	sanitizeHogQLString,
} from "@/shared/lib/posthogServer";

export async function GET(request: Request): Promise<NextResponse> {
	try {
		const { searchParams } = new URL(request.url);

		const rawPathname = searchParams.get("pathname") ?? "";
		const rawPeriod = searchParams.get("period") ?? "day";

		const period = parsePeriodParam(rawPeriod);
		if (period === null) {
			return NextResponse.json(
				{ error: INVALID_PERIOD_ERROR_MESSAGE },
				{ status: 400 },
			);
		}

		const periodFilter = buildKstPeriodFilter(period);
		const pathFilter = buildPathFilter();

		// pathname 없으면 추적 중인 전체 페이지 기준으로 집계
		const pathnameFilter = rawPathname
			? `properties.$pathname = '${sanitizeHogQLString(rawPathname)}' AND `
			: "";

		// pathname 미지정("전체 페이지") 시 TRACKED_PATHS 전체(현재 "/" 포함, 최대 트래픽 경로)를
		// 스캔해 기본 10s를 넘을 수 있음 — getPathsKpiServer.ts와 동일하게 30s로 완화
		const [totalResult, eventsResult] = await Promise.all([
			runHogQLQuery(
				`
				SELECT count()
				FROM events
				WHERE ${pathnameFilter}${periodFilter}
				AND ${pathFilter}
			`,
				EXTENDED_QUERY_TIMEOUT_MS,
			),
			runHogQLQuery(
				`
				SELECT event, count() AS count
				FROM events
				WHERE ${pathnameFilter}${periodFilter}
				AND ${pathFilter}
				GROUP BY event
				ORDER BY count DESC
				LIMIT 5
			`,
				EXTENDED_QUERY_TIMEOUT_MS,
			),
		]);

		const totalCount = Number(totalResult.results[0]?.[0] ?? 0);

		if (totalCount === 0) {
			return NextResponse.json({
				pathname: rawPathname,
				events: [],
			} satisfies PageEventDistributionResponse);
		}

		const events: PageEventItem[] = eventsResult.results.map((row) => {
			// 쿼리 컬럼 순서 [event, count]를 명시적으로 지정했으므로 안전
			const [event, count] = row as [string, number];
			return {
				event: String(event),
				count: Number(count),
				percentage: Number(((Number(count) / totalCount) * 100).toFixed(1)),
			};
		});

		return NextResponse.json({
			pathname: rawPathname,
			events,
		} satisfies PageEventDistributionResponse);
	} catch (error) {
		console.error("PostHog Page Events API error:", error);
		return NextResponse.json(
			{ error: "페이지 이벤트 분포 데이터를 불러오는 데 실패했습니다" },
			{ status: 500 },
		);
	}
}
