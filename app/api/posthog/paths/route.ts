import { NextResponse } from "next/server"
import { getPathFlowsServer } from "@/entities/event/api/getPathFlowsServer"
import type { PathStepCount } from "@/entities/event/model/paths"
import { VALID_PATH_STEP_COUNTS } from "@/entities/event/model/paths"
import {
	INVALID_PERIOD_ERROR_MESSAGE,
	isValidPathParam,
	parsePeriodParam,
} from "@/shared/lib/posthogServer"
import { captureError } from "@/shared/lib/sentry"

export async function GET(request: Request): Promise<NextResponse> {
	try {
		const { searchParams } = new URL(request.url)
		const rawStart = searchParams.get("start") ?? "all"
		const rawPeriod = searchParams.get("period") ?? "week"
		const rawSteps = Number(searchParams.get("steps") ?? "3")

		// "all" = 시작점 필터 없음(전체 경로) — 사용자별 실제 첫 방문 페이지가 Step 0이 된다
		if (!isValidPathParam(rawStart)) {
			return NextResponse.json(
				{ error: "유효하지 않은 start 값입니다." },
				{ status: 400 },
			)
		}
		const startPath = rawStart === "all" ? null : rawStart

		const period = parsePeriodParam(rawPeriod)
		if (period === null) {
			return NextResponse.json(
				{ error: INVALID_PERIOD_ERROR_MESSAGE },
				{ status: 400 },
			)
		}

		// PathStepCount[] 타입의 includes()에 number를 넘기기 위해 as 필요
		if (!VALID_PATH_STEP_COUNTS.includes(rawSteps as PathStepCount)) {
			return NextResponse.json(
				{ error: "유효하지 않은 steps 값입니다. 1~5 중 하나를 사용하세요." },
				{ status: 400 },
			)
		}

		// 위 includes() 검증 완료 후 안전한 단언
		const data = await getPathFlowsServer(startPath, period, rawSteps as PathStepCount)
		return NextResponse.json(data)
	} catch (error) {
		captureError(error, { context: "Paths Flow API route" })
		return NextResponse.json(
			{ error: "경로 흐름 데이터를 불러오는 데 실패했습니다" },
			{ status: 500 },
		)
	}
}
