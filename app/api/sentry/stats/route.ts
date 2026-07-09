import { NextResponse } from "next/server";
import type {
  ErrorStatPoint,
  ErrorStatsPeriod,
} from "@/entities/error/model/errorStats";
import {
  VALID_PERIODS,
  PERIOD_INTERVAL,
  PERIOD_LIMIT,
} from "@/entities/error/model/errorStats";
import { buildDailySlots } from "@/entities/error/model/errorStatsUtils";
import {
  getSentryConfig,
  sentryFetch,
  SENTRY_HOST,
} from "@/shared/api/sentryClient";

interface SentryStatsResponse {
  period: ErrorStatsPeriod;
  stats: ErrorStatPoint[];
}

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** KST 기준 당일 0시의 UTC 타임스탬프(초)를 반환 */
const getKstTodayTimestamp = (): number => {
  const nowKst = new Date(Date.now() + KST_OFFSET_MS);
  const startOfDayKstMs =
    Date.UTC(
      nowKst.getUTCFullYear(),
      nowKst.getUTCMonth(),
      nowKst.getUTCDate(),
      0,
      0,
      0,
    ) - KST_OFFSET_MS;
  return Math.floor(startOfDayKstMs / 1000);
};

/**
 * Sentry API가 금일(아직 끝나지 않은 날) 버킷을 반환하지 않을 경우
 * 금일 슬롯을 count 0으로 추가하여 차트에 표시
 */
const ensureTodaySlot = (stats: ErrorStatPoint[]): ErrorStatPoint[] => {
  if (stats.length === 0) return stats;

  const todayTimestamp = getKstTodayTimestamp();
  const lastTimestamp = stats[stats.length - 1].timestamp;

  if (lastTimestamp < todayTimestamp) {
    return [...stats, { timestamp: todayTimestamp, count: 0 }];
  }
  return stats;
};

export const GET = async (request: Request): Promise<NextResponse> => {
  const config = getSentryConfig();

  if (!config) {
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
      `/api/0/organizations/${encodeURIComponent(config.org)}/events-stats/`,
      SENTRY_HOST,
    );
    statsUrl.searchParams.set("field", "count()");
    statsUrl.searchParams.set("interval", interval);
    statsUrl.searchParams.set("dataset", "errors");

    if (period === "24h") {
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
      const startUtc = new Date(startOfDayKst.getTime() - KST_OFFSET_MS);
      const endUtc = new Date(startUtc.getTime() + 24 * 60 * 60 * 1000 - 1);
      statsUrl.searchParams.set("start", startUtc.toISOString());
      statsUrl.searchParams.set("end", endUtc.toISOString());
    } else {
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
      const startUtc = new Date(startOfDayKst.getTime() - KST_OFFSET_MS);
      const daysBack = period === "7d" ? 7 : 30;
      const start = new Date(
        startUtc.getTime() - daysBack * 24 * 60 * 60 * 1000,
      );
      statsUrl.searchParams.set("start", start.toISOString());
      statsUrl.searchParams.set("end", new Date().toISOString());
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

    const allStats = (
      raw as { data: [number, { count: number }[]][] }
    ).data.map(([timestamp, values]) => ({
      timestamp,
      count: values[0]?.count ?? 0,
    }));

    const stats =
      period === "24h"
        ? buildDailySlots(allStats)
        : ensureTodaySlot(allStats).slice(-PERIOD_LIMIT[period]);

    return NextResponse.json({ period, stats } satisfies SentryStatsResponse);
  } catch (error) {
    console.error("Sentry Stats API error:", error);
    return NextResponse.json(
      { error: "통계 데이터를 불러오는 데 실패했습니다" },
      { status: 500 },
    );
  }
};
