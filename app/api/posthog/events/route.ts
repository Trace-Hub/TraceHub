import { NextResponse } from "next/server";
import {
	fetchEventStatsServer,
	MAX_LIMIT,
	PER_PAGE,
} from "@/entities/event/api/fetchEventStatsServer";
import {
	EVENT_CATEGORY_LABELS,
	type EventCategory,
} from "@/entities/event/model/eventCategory";
import {
	INVALID_PERIOD_ERROR_MESSAGE,
	parsePeriodParam,
	resolvePathFilter,
} from "@/shared/lib/posthogServer";

// EVENT_CATEGORY_LABELS가 Record<EventCategory, string>로 선언돼 있어 컴파일 타임에
// 모든 EventCategory 값을 포함하도록 강제됨 — VALID_CATEGORIES를 별도로 하드코딩하지 않고
// 여기서 파생시켜, 새 카테고리 추가 시 갱신을 누락해도 조용히 400 처리되는 걸 방지
const VALID_CATEGORIES = Object.keys(EVENT_CATEGORY_LABELS) as EventCategory[];

export async function GET(request: Request): Promise<NextResponse> {
	try {
		const { searchParams } = new URL(request.url);
		const rawPeriod = searchParams.get("period") ?? "day";
		const rawPath = searchParams.get("path") ?? "all";
		const rawCategory = searchParams.get("category") ?? "all";
		const search = searchParams.get("q") ?? "";
		const cursor = searchParams.get("cursor");
		// OverviewChart처럼 전체 이벤트 타입 합계가 필요한 소비처를 위한 escape hatch.
		// 무한스크롤 목록(TrendsDashboard)은 이 파라미터를 넘기지 않아 기본 PER_PAGE를 사용
		const rawLimit = searchParams.get("limit");
		const parsedLimit = rawLimit ? Number.parseInt(rawLimit, 10) : PER_PAGE;
		const limit =
			Number.isFinite(parsedLimit) && parsedLimit > 0
				? Math.min(parsedLimit, MAX_LIMIT)
				: PER_PAGE;

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

		if (!VALID_CATEGORIES.includes(rawCategory as EventCategory)) {
			return NextResponse.json(
				{ error: "유효하지 않은 category 값입니다." },
				{ status: 400 },
			);
		}
		const category = rawCategory as EventCategory;

		const data = await fetchEventStatsServer(
			period,
			pathFilter,
			category,
			search,
			cursor,
			limit,
		);
		return NextResponse.json(data);
	} catch (error) {
		console.error("PostHog Query API error:", error);
		return NextResponse.json(
			{ error: "이벤트 데이터를 불러오는 데 실패했습니다" },
			{ status: 500 },
		);
	}
}
