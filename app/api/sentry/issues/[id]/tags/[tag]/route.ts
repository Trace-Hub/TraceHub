import { NextResponse } from "next/server";
import type {
  ErrorTagResponse,
  ErrorTagType,
} from "@/entities/error/model/errorStats";

const SENTRY_HOST = "https://sentry.io";
const VALID_TAGS: ErrorTagType[] = [
  "browser.name",
  "os.name",
  "environment",
  "device.family",
];

export const GET = async (
  request: Request,
  { params }: { params: Promise<{ id: string; tag: string }> },
): Promise<NextResponse> => {
  const SENTRY_AUTH_TOKEN = process.env.NEXT_SENTRY_API_TOKEN;
  const SENTRY_ORG = process.env.NEXT_SENTRY_ORG;

  if (!SENTRY_AUTH_TOKEN || !SENTRY_ORG) {
    return NextResponse.json(
      { error: "Sentry 환경변수가 설정되지 않았습니다" },
      { status: 500 },
    );
  }

  try {
    const { id, tag } = await params;

    if (!VALID_TAGS.includes(tag as ErrorTagType)) {
      return NextResponse.json(
        {
          error:
            "유효하지 않은 tag 값입니다. browser.name | os.name | environment | device 중 하나를 사용하세요.",
        },
        { status: 400 },
      );
    }

    const response = await fetch(
      `${SENTRY_HOST}/api/0/organizations/${SENTRY_ORG}/issues/${id}/tags/${tag}/`,
      {
        headers: { Authorization: `Bearer ${SENTRY_AUTH_TOKEN}` },
      },
    );

    if (!response.ok) {
      // 태그가 없는 경우 빈 배열 반환
      if (response.status === 404) {
        return NextResponse.json({
          issueId: id,
          tag: tag as ErrorTagType,
          values: [],
        } satisfies ErrorTagResponse);
      }
      throw new Error(`Sentry API responded with ${response.status}`);
    }

    const raw = await response.json();

    const values = raw.topValues.map((v: Record<string, unknown>) => ({
      value: v.value as string,
      count: v.count as number,
      percentage: Number(
        (((v.count as number) / (raw.totalValues as number)) * 100).toFixed(1),
      ),
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
