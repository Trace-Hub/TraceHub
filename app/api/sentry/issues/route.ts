import { NextResponse } from "next/server";
import type {
  SentryIssue,
  ErrorListResponse,
  ErrorStatus,
} from "@/entities/error/model/errorStats";
import { getSentryConfig, sentryFetch } from "@/shared/api/sentryClient";

const VALID_STATUSES: ErrorStatus[] = ["unresolved", "ignored", "resolved"];

export const GET = async (request: Request): Promise<NextResponse> => {
  const config = getSentryConfig();

  if (!config || !config.project) {
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

    const response = await sentryFetch(
      `/api/0/projects/${config.org}/${config.project}/issues/?${params}`,
      config,
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

    // 각 이슈의 http.status_code 태그를 병렬 조회
    const issuesWithStatus = await Promise.all(
      issues.map(async (issue) => {
        try {
          const tagRes = await sentryFetch(
            `/api/0/organizations/${config.org}/issues/${issue.id}/tags/http.status_code/`,
            config,
          );
          if (tagRes.ok) {
            const tagData = await tagRes.json();
            const topValue = tagData?.topValues?.[0]?.value;
            return { ...issue, httpStatusCode: topValue ?? undefined };
          }
        } catch {
          // 태그 조회 실패 또는 타임아웃 시 무시
        }
        return issue;
      }),
    );

    return NextResponse.json({
      issues: issuesWithStatus,
    } satisfies ErrorListResponse);
  } catch (error) {
    console.error("Sentry API error:", error);
    return NextResponse.json(
      { error: "Sentry 에러 데이터를 불러오는 데 실패했습니다" },
      { status: 500 },
    );
  }
};
