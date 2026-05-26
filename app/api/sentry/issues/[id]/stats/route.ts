import { NextResponse } from "next/server";
import type {
  ErrorStatsResponse,
  ErrorStatsPeriod,
} from "@/entities/error/model/errorStats";

const SENTRY_HOST = "https://sentry.io";
const VALID_PERIODS: ErrorStatsPeriod[] = ["24h", "7d", "30d"];

const PERIOD_INTERVAL: Record<ErrorStatsPeriod, string> = {
  "24h": "1h",
  "7d": "1d",
  "30d": "1d",
};

// Sentry issues stats API period 파라미터 매핑
const PERIOD_PARAM: Record<ErrorStatsPeriod, string> = {
  "24h": "24h",
  "7d": "7d",
  "30d": "30d",
};

export const GET = async (
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> => {
  const SENTRY_AUTH_TOKEN = process.env.NEXT_SENTRY_API_TOKEN;
  const SENTRY_ORG = process.env.NEXT_SENTRY_ORG;
  const SENTRY_PROJECT = process.env.NEXT_SENTRY_PROJECT;

  if (!SENTRY_AUTH_TOKEN || !SENTRY_ORG || !SENTRY_PROJECT) {
    return NextResponse.json(
      { error: "Sentry 환경변수가 설정되지 않았습니다" },
      { status: 500 },
    );
  }

  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const rawPeriod = searchParams.get("period") ?? "24h";

    if (!VALID_PERIODS.includes(rawPeriod as ErrorStatsPeriod)) {
      return NextResponse.json(
        {
          error:
            "유효하지 않은 period 값입니다. 24h | 7d | 30d 중 하나를 사용하세요.",
        },
        { status: 400 },
      );
    }

    const period = rawPeriod as ErrorStatsPeriod;
    const interval = PERIOD_INTERVAL[period];
    const periodParam = PERIOD_PARAM[period];

    const statsUrl = `${SENTRY_HOST}/api/0/organizations/${SENTRY_ORG}/events-stats/?field=count()&query=issue.id:${id}&period=${periodParam}&interval=${interval}&dataset=errors`;

    const response = await fetch(statsUrl, {
      headers: { Authorization: `Bearer ${SENTRY_AUTH_TOKEN}` },
    });

    if (!response.ok) {
      throw new Error(`Sentry API responded with ${response.status}`);
    }

    const raw = await response.json();

    // events-stats 응답 형식: { data: [[timestamp, [{count: n}]], ...] }
    const allStats = raw.data.map(
      ([timestamp, values]: [number, { count: number }[]]) => ({
        timestamp,
        count: values[0]?.count ?? 0,
      }),
    );

    // period에 맞게 최근 데이터만 슬라이싱
    const PERIOD_LIMIT: Record<ErrorStatsPeriod, number> = {
      "24h": 24,
      "7d": 7,
      "30d": 30,
    };
    const limit = PERIOD_LIMIT[period];
    const stats = allStats.slice(-limit);

    return NextResponse.json({
      issueId: id,
      period,
      stats,
    } satisfies ErrorStatsResponse);
  } catch (error) {
    console.error("Sentry Stats API error:", error);
    return NextResponse.json(
      { error: "통계 데이터를 불러오는 데 실패했습니다" },
      { status: 500 },
    );
  }
};
