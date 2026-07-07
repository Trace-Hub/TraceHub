import { NextResponse } from "next/server"
import { getPathsKpiServer } from "@/entities/event/api/getPathsKpiServer"
import {
	INVALID_PERIOD_ERROR_MESSAGE,
	parsePeriodParam,
} from "@/shared/lib/posthogServer"
import { captureError } from "@/shared/lib/sentry"

export async function GET(request: Request): Promise<NextResponse> {
	try {
		const { searchParams } = new URL(request.url)
		const rawPeriod = searchParams.get("period") ?? "week"

		const period = parsePeriodParam(rawPeriod)
		if (period === null) {
			return NextResponse.json(
				{ error: INVALID_PERIOD_ERROR_MESSAGE },
				{ status: 400 },
			)
		}

		const data = await getPathsKpiServer(period)
		return NextResponse.json(data)
	} catch (error) {
		captureError(error, { context: "Paths KPI API route" })
		return NextResponse.json(
			{ error: "경로 KPI 데이터를 불러오는 데 실패했습니다" },
			{ status: 500 },
		)
	}
}
