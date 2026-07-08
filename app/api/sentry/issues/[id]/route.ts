import { NextResponse } from "next/server";
import type { SentryIssue } from "@/entities/error/model/errorStats";
import { getSentryConfig, sentryFetch } from "@/shared/api/sentryClient";

export const GET = async (
  _request: Request,
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

    if (!/^\d+$/.test(id)) {
      return NextResponse.json(
        { error: "유효하지 않은 issue id입니다." },
        { status: 400 },
      );
    }

    const response = await sentryFetch(
      `/api/0/organizations/${encodeURIComponent(config.org)}/issues/${id}/`,
      config,
    );

    if (!response.ok) {
      throw new Error(`Sentry API responded with ${response.status}`);
    }

    const raw: unknown = await response.json();

    if (typeof raw !== "object" || raw === null || !("id" in raw)) {
      throw new Error("Sentry API 응답 형식이 올바르지 않습니다");
    }

    const r = raw as Record<string, unknown>;

    const VALID_STATUSES = ["unresolved", "ignored", "resolved"] as const;
    const VALID_LEVELS = ["error", "fatal", "warning", "info"] as const;

    const rawStatus = r.status;
    const rawLevel = r.level;

    const issue: SentryIssue = {
      id: String(r.id ?? ""),
      title: String(r.title ?? ""),
      culprit: String(r.culprit ?? ""),
      status: VALID_STATUSES.includes(
        rawStatus as (typeof VALID_STATUSES)[number],
      )
        ? (rawStatus as SentryIssue["status"])
        : "unresolved",
      level: VALID_LEVELS.includes(rawLevel as (typeof VALID_LEVELS)[number])
        ? (rawLevel as SentryIssue["level"])
        : "error",
      count: String(r.count ?? "0"),
      userCount: typeof r.userCount === "number" ? r.userCount : 0,
      firstSeen: String(r.firstSeen ?? ""),
      lastSeen: String(r.lastSeen ?? ""),
      isUnhandled: Boolean(r.isUnhandled),
      metadata: (r.metadata as SentryIssue["metadata"]) ?? {},
      annotations: Array.isArray(r.annotations)
        ? (r.annotations as string[])
        : [],
      shortId: String(r.shortId ?? ""),
      permalink: String(r.permalink ?? ""),
    };

    return NextResponse.json(issue);
  } catch (error) {
    console.error("Sentry Issue API error:", error);
    return NextResponse.json(
      { error: "이슈 데이터를 불러오는 데 실패했습니다" },
      { status: 500 },
    );
  }
};
