import { NextResponse } from "next/server";
import { fetchEventKpiServer } from "@/entities/event/api/fetchEventKpiServer";
import { resolvePathFilter } from "@/shared/lib/posthogServer";

export async function GET(request: Request): Promise<NextResponse> {
	try {
		const { searchParams } = new URL(request.url);
		const rawPath = searchParams.get("path") ?? "all";

		const pathFilter = resolvePathFilter(rawPath);
		if (pathFilter === null) {
			return NextResponse.json(
				{ error: "유효하지 않은 path 값입니다." },
				{ status: 400 },
			);
		}

		const data = await fetchEventKpiServer(pathFilter);
		return NextResponse.json(data);
	} catch (error) {
		console.error("PostHog KPI API error:", error);
		return NextResponse.json(
			{ error: "KPI 데이터를 불러오는 데 실패했습니다" },
			{ status: 500 },
		);
	}
}
