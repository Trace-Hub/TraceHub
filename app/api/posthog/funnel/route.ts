import { NextResponse } from "next/server";
import { getFunnelServer } from "@/entities/event/api/getFunnelServer";
import type { FunnelPeriod } from "@/entities/event/model/funnel";
import { VALID_FUNNEL_PERIODS } from "@/entities/event/model/funnel";
import { FUNNEL_CONFIG } from "@/shared/config/funnelConfig";
import { captureError } from "@/shared/lib/sentry";

export async function GET(request: Request): Promise<NextResponse> {
	try {
		const { searchParams } = new URL(request.url);
		const rawPeriod = searchParams.get("period") ?? "7d";
		const funnelId =
			searchParams.get("funnelId") ?? FUNNEL_CONFIG[0]?.id ?? "default";

		if (!VALID_FUNNEL_PERIODS.includes(rawPeriod as FunnelPeriod)) {
			return NextResponse.json(
				{
					error:
						"유효하지 않은 period 값입니다. 7d | 30d 중 하나를 사용하세요.",
				},
				{ status: 400 },
			);
		}

		const data = await getFunnelServer(funnelId, rawPeriod as FunnelPeriod);
		return NextResponse.json(data);
	} catch (error) {
		captureError(error, { context: "Funnel API route" });
		return NextResponse.json(
			{ error: "퍼널 데이터를 불러오는 데 실패했습니다" },
			{ status: 500 },
		);
	}
}
