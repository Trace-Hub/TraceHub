import { NextResponse } from "next/server";
import type {
  ErrorStatsResponse,
  ErrorStatsPeriod,
} from "@/entities/error/model/errorStats";
import {
  VALID_PERIODS,
  PERIOD_INTERVAL,
  PERIOD_LIMIT,
} from "@/entities/error/model/errorStats";
import {
  getSentryConfig,
  sentryFetch,
  SENTRY_HOST,
} from "@/shared/api/sentryClient";

const PERIOD_PARAM: Record<ErrorStatsPeriod, string> = {
  "24h": "24h",
  "7d": "7d",
  "30d": "30d",
};

export const GET = async (
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> => {
  const config = getSentryConfig();

  if (!config) {
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
      `/api/0/organizations/${encodeURIComponent(config.org)}/events-stats/`,
      SENTRY_HOST,
    );
    statsUrl.searchParams.set("field", "count()");
    statsUrl.searchParams.set("query", `issue.id:${id}`);
    statsUrl.searchParams.set("interval", interval);
    statsUrl.searchParams.set("dataset", "errors");

    // 오늘(24h)은 KST 기준 당일 0시~23시 고정
    if (period === "24h") {
      const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
      const nowKst = new Date(Date.now() + KST_OFFSET_MS);
      const startOfDayKst = new Date(
        Date.UTC(
          nowKst.getUTCFullYear(),
          nowKst.getUTCMonth(),
          nowKst.getUTCDate(),
          0,
          0,
          0,
        ),
      );
      // KST 0시를 UTC로 변환 (KST 0시 = UTC 전날 15시)
      const startUtc = new Date(startOfDayKst.getTime() - KST_OFFSET_MS);
      const endUtc = new Date(startUtc.getTime() + 24 * 60 * 60 * 1000 - 1);
      statsUrl.searchParams.set("start", startUtc.toISOString());
      statsUrl.searchParams.set("end", endUtc.toISOString());
    } else {
      statsUrl.searchParams.set("period", periodParam);
    }

    const response = await sentryFetch(
      statsUrl.pathname + statsUrl.search,
      config,
    );

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
