import { NextResponse } from "next/server";
import type {
  SentryIssue,
  ErrorListResponse,
  ErrorStatus,
} from "@/entities/error/model/errorStats";

const SENTRY_HOST = "https://sentry.io";
const VALID_STATUSES: ErrorStatus[] = ["unresolved", "ignored", "resolved"];

export const GET = async (request: Request): Promise<NextResponse> => {
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
    const { searchParams } = new URL(request.url);
    const rawStatus = searchParams.get("status") ?? "unresolved";
    const environment = searchParams.get("environment") ?? "";
    const query = searchParams.get("query") ?? "";

    // status 허용값 검증
    if (!VALID_STATUSES.includes(rawStatus as ErrorStatus)) {
      return NextResponse.json(
        {
          error:
            "유효하지 않은 status 값입니다. unresolved | ignored | resolved 중 하나를 사용하세요.",
        },
        { status: 400 },
      );
    }

    const status = rawStatus as ErrorStatus;

    const params = new URLSearchParams({
      query: `is:${status}${query ? ` ${query}` : ""}`,
      ...(environment && { environment }),
    });

    const response = await fetch(
      `${SENTRY_HOST}/api/0/projects/${SENTRY_ORG}/${SENTRY_PROJECT}/issues/?${params}`,
      {
        headers: {
          Authorization: `Bearer ${SENTRY_AUTH_TOKEN}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Sentry API responded with ${response.status}`);
    }

    const rawIssues = await response.json();

    const issues: SentryIssue[] = rawIssues.map(
      (issue: Record<string, unknown>) => ({
        id: issue.id,
        title: issue.title,
        culprit: issue.culprit,
        status: issue.status,
        level: issue.level,
        count: issue.count,
        userCount: issue.userCount,
        firstSeen: issue.firstSeen,
        lastSeen: issue.lastSeen,
        isUnhandled: issue.isUnhandled,
        metadata: issue.metadata,
        annotations: issue.annotations,
        shortId: issue.shortId,
        permalink: issue.permalink,
      }),
    );

    return NextResponse.json({ issues } satisfies ErrorListResponse);
  } catch (error) {
    console.error("Sentry API error:", error);
    return NextResponse.json(
      { error: "Sentry 에러 데이터를 불러오는 데 실패했습니다" },
      { status: 500 },
    );
  }
};
