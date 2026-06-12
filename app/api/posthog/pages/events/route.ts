import { NextResponse } from "next/server";
import type {
	PageEventDistributionResponse,
	PageEventItem,
	Period,
} from "@/entities/event/model/eventStats";
import {
	buildKstPeriodFilter,
	buildPathFilter,
	runHogQLQuery,
	sanitizeHogQLString,
	VALID_PERIODS,
} from "@/shared/lib/posthogServer";

export async function GET(request: Request): Promise<NextResponse> {
	try {
		const { searchParams } = new URL(request.url);

		const rawPathname = searchParams.get("pathname") ?? "";
		const rawPeriod = searchParams.get("period") ?? "day";

		// Period[] 타입의 includes()에 string을 넘기기 위해 as 필요
		if (!VALID_PERIODS.includes(rawPeriod as Period)) {
			return NextResponse.json(
				{
					error:
						"유효하지 않은 period 값입니다. day | week | month 중 하나를 사용하세요.",
				},
				{ status: 400 },
			);
		}

		// includes() 검증 완료 후 안전한 단언
		const period = rawPeriod as Period;
		const periodFilter = buildKstPeriodFilter(period);
		const pathFilter = buildPathFilter();

		// pathname 없으면 추적 중인 전체 페이지 기준으로 집계
		const pathnameFilter = rawPathname
			? `properties.$pathname = '${sanitizeHogQLString(rawPathname)}' AND `
			: "";

		const [totalResult, eventsResult] = await Promise.all([
			runHogQLQuery(`
				SELECT count()
				FROM events
				WHERE ${pathnameFilter}${periodFilter}
				AND ${pathFilter}
			`),
			runHogQLQuery(`
				SELECT event, count() AS count
				FROM events
				WHERE ${pathnameFilter}${periodFilter}
				AND ${pathFilter}
				GROUP BY event
				ORDER BY count DESC
				LIMIT 5
			`),
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
