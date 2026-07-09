import type { ErrorEvent } from "@sentry/nextjs";

export const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

export const SENTRY_CONFIG = {
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,
  replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  replaysOnErrorSampleRate: 1.0,
  enableLogs: true,
} as const;

/**
 * breadcrumbs에서 HTTP 상태 코드를 추출하여 이벤트 태그에 추가
 * 에러 발생 시점의 마지막 HTTP 요청 상태를 기록하여 400/500 분류에 활용
 */
const attachHttpStatusTag = (event: ErrorEvent): ErrorEvent => {
  const httpBreadcrumb = event.breadcrumbs?.findLast(
    (b) =>
      (b.category === "http" || b.category === "fetch") && b.data?.status_code,
  );
  if (httpBreadcrumb?.data?.status_code) {
    const statusCode = String(httpBreadcrumb.data.status_code);

    event.tags = {
      ...event.tags,
      "http.status_code": statusCode,
    };

    // 기본 스택 그룹핑 + status_code로 추가 분리 (기존 fingerprint 보존)
    event.fingerprint = [
      ...(event.fingerprint ?? ["{{ default }}"]),
      statusCode,
    ];
  }
  return event;
};

export const SENTRY_SERVER_CONFIG = {
  ...SENTRY_CONFIG,
  sendDefaultPii: true,
  beforeSend: attachHttpStatusTag,
} as const;

export const SENTRY_CLIENT_CONFIG = {
  ...SENTRY_CONFIG,
  sendDefaultPii: false,
  beforeSend: attachHttpStatusTag,
} as const;
