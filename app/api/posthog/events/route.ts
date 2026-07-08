import { NextResponse } from "next/server";
import { fetchEventStatsServer } from "@/entities/event/api/fetchEventStatsServer";
import {
	INVALID_PERIOD_ERROR_MESSAGE,
	parsePeriodParam,
	resolvePathFilter,
} from "@/shared/lib/posthogServer";

export async function GET(request: Request): Promise<NextResponse> {
	try {
		const { searchParams } = new URL(request.url);
		const rawPeriod = searchParams.get("period") ?? "day";
		const rawPath = searchParams.get("path") ?? "all";

		const period = parsePeriodParam(rawPeriod);
		if (period === null) {
			return NextResponse.json(
				{ error: INVALID_PERIOD_ERROR_MESSAGE },
				{ status: 400 },
			);
		}

		const pathFilter = resolvePathFilter(rawPath);
		if (pathFilter === null) {
			return NextResponse.json(
				{ error: "유효하지 않은 path 값입니다." },
				{ status: 400 },
			);
		}

		const data = await fetchEventStatsServer(period, pathFilter);
		return NextResponse.json(data);
	} catch (error) {
		console.error("PostHog Query API error:", error);
		return NextResponse.json(
			{ error: "이벤트 데이터를 불러오는 데 실패했습니다" },
			{ status: 500 },
		);
	}
}
