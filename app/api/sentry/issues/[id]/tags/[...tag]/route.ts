import { NextResponse } from "next/server";
import type {
  ErrorTagResponse,
  ErrorTagType,
} from "@/entities/error/model/errorStats";
import { getSentryConfig, sentryFetch } from "@/shared/api/sentryClient";

const VALID_TAGS: ErrorTagType[] = ["browser.name", "os.name", "environment"];

export const GET = async (
  _request: Request,
  { params }: { params: Promise<{ id: string; tag: string[] }> },
): Promise<NextResponse> => {
  const config = getSentryConfig();

  if (!config) {
    return NextResponse.json(
      { error: "Sentry 환경변수가 설정되지 않았습니다" },
      { status: 500 },
    );
  }

  try {
    const { id, tag: tagSegments } = await params;
    // [...tag] catch-all: ["browser", "name"] → "browser.name"
    const tag = tagSegments.join(".");

    if (!VALID_TAGS.includes(tag as ErrorTagType)) {
      return NextResponse.json(
        {
          error: `유효하지 않은 tag 값입니다. ${VALID_TAGS.join(" | ")} 중 하나를 사용하세요.`,
        },
        { status: 400 },
      );
    }

    const response = await sentryFetch(
      `/api/0/organizations/${encodeURIComponent(config.org)}/issues/${id}/tags/${tag}/`,
      config,
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({
          issueId: id,
          tag: tag as ErrorTagType,
          values: [],
        } satisfies ErrorTagResponse);
      }
      throw new Error(`Sentry API responded with ${response.status}`);
    }

    const raw: unknown = await response.json();

    if (
      typeof raw !== "object" ||
      raw === null ||
      !("topValues" in raw) ||
      !Array.isArray((raw as { topValues: unknown }).topValues)
    ) {
      throw new Error("Sentry API 응답 형식이 올바르지 않습니다");
    }

    const { topValues, totalValues } = raw as {
      topValues: { value: unknown; count: unknown }[];
      totalValues: unknown;
    };

    const total =
      typeof totalValues === "number" && totalValues > 0 ? totalValues : 0;

    const values = topValues.map((v) => ({
      value: typeof v.value === "string" ? v.value : String(v.value),
      count: typeof v.count === "number" ? v.count : 0,
      percentage:
        total > 0
          ? Number(
              (
                ((typeof v.count === "number" ? v.count : 0) / total) *
                100
              ).toFixed(1),
            )
          : 0,
    }));

    return NextResponse.json({
      issueId: id,
      tag: tag as ErrorTagType,
      values,
    } satisfies ErrorTagResponse);
  } catch (error) {
    console.error("Sentry Tags API error:", error);
    return NextResponse.json(
      { error: "태그 데이터를 불러오는 데 실패했습니다" },
      { status: 500 },
    );
  }
};
