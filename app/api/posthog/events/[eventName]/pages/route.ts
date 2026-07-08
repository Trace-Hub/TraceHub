import { NextResponse } from "next/server";
import type {
	EventPageStat,
	EventPagesResponse,
} from "@/entities/event/model/eventStats";
import {
	buildKstPeriodFilter,
	buildPathFilter,
	INVALID_PERIOD_ERROR_MESSAGE,
	parsePeriodParam,
	runHogQLQuery,
	sanitizeHogQLString,
} from "@/shared/lib/posthogServer";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ eventName: string }> },
): Promise<NextResponse> {
	try {
		const { eventName: rawEventName } = await params;
		// Next.js App Router가 params를 이미 디코드하므로 decodeURIComponent 중복 호출 불필요
		const eventName = sanitizeHogQLString(rawEventName);

		const { searchParams } = new URL(request.url);
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

		// 전체 발생 횟수(분모)와 페이지별 집계(분자)를 병렬로 조회
		const [totalResult, pagesResult] = await Promise.all([
			runHogQLQuery(`
				SELECT count()
				FROM events
				WHERE event = '${eventName}'
				AND properties.$pathname IS NOT NULL
				AND ${periodFilter}
				AND ${pathFilter}
			`),
			runHogQLQuery(`
				SELECT
					properties.$pathname,
					count() AS count,
					countDistinct(properties.$session_id) AS session_count
				FROM events
				WHERE event = '${eventName}'
				AND properties.$pathname IS NOT NULL
				AND ${periodFilter}
				AND ${pathFilter}
				GROUP BY properties.$pathname
				ORDER BY count DESC
				LIMIT 100
			`),
		]);

		const totalCount = Number(totalResult.results[0]?.[0] ?? 0);

		if (totalCount === 0) {
			return NextResponse.json({
				event: eventName,
				pages: [],
			} satisfies EventPagesResponse);
		}

		const pages: EventPageStat[] = pagesResult.results.map((row) => {
			// 쿼리 컬럼 순서 [pathname, count, session_count]를 명시적으로 지정했으므로 안전
			const [pathname, count, sessionCount] = row as [string, number, number];
			return {
				pathname: String(pathname),
				count: Number(count),
				sessionCount: Number(sessionCount),
				percentage: Number(((Number(count) / totalCount) * 100).toFixed(1)),
			};
		});

		return NextResponse.json({
			event: eventName,
			pages,
		} satisfies EventPagesResponse);
	} catch (error) {
		console.error("PostHog Pages API error:", error);
		return NextResponse.json(
			{ error: "페이지별 데이터를 불러오는 데 실패했습니다" },
			{ status: 500 },
		);
	}
}
