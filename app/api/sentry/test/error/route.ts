import { NextResponse } from "next/server";

/**
 * 테스트용: 지정된 HTTP 상태 코드로 에러 응답을 반환
 * 사용: GET /api/sentry/test/error?status=500
 */
export const GET = (request: Request): NextResponse => {
  const { searchParams } = new URL(request.url);
  const status = Number(searchParams.get("status") ?? "500");

  return NextResponse.json(
    { error: `테스트 에러: HTTP ${status}` },
    { status },
  );
};
