import { NextResponse } from "next/server";
import type {
  ErrorStatPoint,
  ErrorStatsPeriod,
} from "@/entities/error/model/errorStats";
import { buildDailySlots } from "@/entities/error/model/errorStatsUtils";

interface SentryStatsResponse {
  period: ErrorStatsPeriod;
  stats: ErrorStatPoint[];
}

const SENTRY_HOST = "https://sentry.io";
const VALID_PERIODS: ErrorStatsPeriod[] = ["24h", "7d", "30d"];

const PERIOD_INTERVAL: Record<ErrorStatsPeriod, string> = {
  "24h": "1h",
  "7d": "1d",
  "30d": "1d",
};

const PERIOD_LIMIT: Record<ErrorStatsPeriod, number> = {
  "24h": 24,
  "7d": 7,
  "30d": 30,
};

export const GET = async (request: Request): Promise<NextResponse> => {
  const SENTRY_AUTH_TOKEN = process.env.NEXT_SENTRY_API_TOKEN;
  const SENTRY_ORG = process.env.NEXT_SENTRY_ORG;

  if (!SENTRY_AUTH_TOKEN || !SENTRY_ORG) {
    return NextResponse.json(
      { error: "Sentry 환경변수가 설정되지 않았습니다" },
      { status: 500 },
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const rawPeriod = searchParams.get("period") ?? "24h";

    if (!VALID_PERIODS.includes(rawPeriod as ErrorStatsPeriod)) {
      return NextResponse.json(
        { error: "유효하지 않은 period 값입니다." },
        { status: 400 },
      );
    }

    const period = rawPeriod as ErrorStatsPeriod;
    const interval = PERIOD_INTERVAL[period];

    const statsUrl = new URL(
      `/api/0/organizations/${encodeURIComponent(SENTRY_ORG)}/events-stats/`,
      SENTRY_HOST,
    );
    statsUrl.searchParams.set("field", "count()");
    statsUrl.searchParams.set("interval", interval);
    statsUrl.searchParams.set("dataset", "errors");

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
      statsUrl.searchParams.set("period", period);
    }

    const response = await fetch(statsUrl.toString(), {
      headers: { Authorization: `Bearer ${SENTRY_AUTH_TOKEN}` },
      signal: AbortSignal.timeout(10000),
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

    const allStats = (
      raw as { data: [number, { count: number }[]][] }
    ).data.map(([timestamp, values]) => ({
      timestamp,
      count: values[0]?.count ?? 0,
    }));

    const stats =
      period === "24h"
        ? buildDailySlots(allStats)
        : allStats.slice(-PERIOD_LIMIT[period]);

    return NextResponse.json({ period, stats } satisfies SentryStatsResponse);
  } catch (error) {
    console.error("Sentry Stats API error:", error);
    return NextResponse.json(
      { error: "통계 데이터를 불러오는 데 실패했습니다" },
      { status: 500 },
    );
  }
};
