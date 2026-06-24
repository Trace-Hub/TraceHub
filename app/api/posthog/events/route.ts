import { NextResponse } from "next/server";
import type { Period } from "@/entities/event/model/eventStats";
import { fetchEventStatsServer } from "@/entities/event/api/fetchEventStatsServer";
import { VALID_PERIODS } from "@/shared/lib/posthogServer";

export async function GET(request: Request): Promise<NextResponse> {
	try {
		const { searchParams } = new URL(request.url);
		const rawPeriod = searchParams.get("period") ?? "day";

		if (!VALID_PERIODS.includes(rawPeriod as Period)) {
			return NextResponse.json(
				{
					error:
						"유효하지 않은 period 값입니다. day | week | month 중 하나를 사용하세요.",
				},
				{ status: 400 },
			);
		}

		const data = await fetchEventStatsServer(rawPeriod as Period);
		return NextResponse.json(data);
	} catch (error) {
		console.error("PostHog Query API error:", error);
		return NextResponse.json(
			{ error: "이벤트 데이터를 불러오는 데 실패했습니다" },
			{ status: 500 },
		);
	}
}
