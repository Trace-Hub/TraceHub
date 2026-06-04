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

const PERIOD_PARAM: Record<ErrorStatsPeriod, string> = {
  "24h": "24h",
  "7d": "7d",
  "30d": "30d",
};

const PERIOD_LIMIT: Record<ErrorStatsPeriod, number> = {
  "24h": 24,
  "7d": 7,
  "30d": 30,
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

    // id 포맷 검증 (숫자만 허용)
    if (!/^\d+$/.test(id)) {
      return NextResponse.json(
        { error: "유효하지 않은 issue id입니다." },
        { status: 400 },
      );
    }

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

    // URLSearchParams로 안전하게 쿼리 조합
    const statsUrl = new URL(
      `/api/0/organizations/${encodeURIComponent(SENTRY_ORG)}/events-stats/`,
      SENTRY_HOST,
    );
    statsUrl.searchParams.set("field", "count()");
    statsUrl.searchParams.set("query", `issue.id:${id}`);
    statsUrl.searchParams.set("interval", interval);
    statsUrl.searchParams.set("dataset", "errors");

    // 오늘(24h)은 당일 0시~23시 고정, 나머지는 period 파라미터 사용
    if (period === "24h") {
      const now = new Date();
      const startOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0,
        0,
        0,
      );
      const endOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59,
      );
      statsUrl.searchParams.set("start", startOfDay.toISOString());
      statsUrl.searchParams.set("end", endOfDay.toISOString());
    } else {
      statsUrl.searchParams.set("period", periodParam);
    }

    const response = await fetch(statsUrl.toString(), {
      headers: { Authorization: `Bearer ${SENTRY_AUTH_TOKEN}` },
    });

    if (!response.ok) {
      throw new Error(`Sentry API responded with ${response.status}`);
    }

    const raw: unknown = await response.json();

    if (
      typeof raw !== "object" ||
      raw === null ||
      !("data" in raw) ||
      !Array.isArray((raw as { data: unknown }).data)
    ) {
      throw new Error("Sentry API 응답 형식이 올바르지 않습니다");
    }

    // events-stats 응답 형식: { data: [[timestamp, [{count: n}]], ...] }
    const allStats = (
      raw as { data: [number, { count: number }[]][] }
    ).data.map(([timestamp, values]) => ({
      timestamp,
      count: values[0]?.count ?? 0,
    }));

    let stats: { timestamp: number; count: number }[];

    if (period === "24h") {
      const { buildDailySlots } =
        await import("@/entities/error/model/errorStatsUtils");
      stats = buildDailySlots(allStats);
    } else {
      // 7일/30일은 최근 N개 슬라이싱
      stats = allStats.slice(-PERIOD_LIMIT[period]);
    }

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
