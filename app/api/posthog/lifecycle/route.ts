import { NextResponse } from "next/server";
import { fetchLifecycleServer } from "@/entities/event/api/fetchLifecycleServer";
import type { LifecyclePeriod } from "@/entities/event/model/lifecycle";
import { VALID_LIFECYCLE_PERIODS } from "@/entities/event/model/lifecycle";

export async function GET(request: Request): Promise<NextResponse> {
	try {
		const { searchParams } = new URL(request.url);
		const rawPeriod = searchParams.get("period") ?? "week";

		if (!VALID_LIFECYCLE_PERIODS.includes(rawPeriod as LifecyclePeriod)) {
			return NextResponse.json(
				{
					error:
						"유효하지 않은 period 값입니다. week | month 중 하나를 사용하세요.",
				},
				{ status: 400 },
			);
		}

		const data = await fetchLifecycleServer(rawPeriod as LifecyclePeriod);
		return NextResponse.json(data);
	} catch (error) {
		console.error("Lifecycle API error:", error);
		return NextResponse.json(
			{ error: "라이프사이클 데이터를 불러오는 데 실패했습니다" },
			{ status: 500 },
		);
	}
}
