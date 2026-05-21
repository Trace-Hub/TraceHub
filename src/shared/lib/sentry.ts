import * as Sentry from "@sentry/nextjs";

/**
 * 에러를 Sentry로 전송
 */
export const captureError = (
  error: unknown,
  context?: Record<string, unknown>,
): void => {
  Sentry.captureException(error, { extra: context });
};

/**
 * 메시지를 Sentry로 전송
 */
export const captureMessage = (
  message: string,
  level: Sentry.SeverityLevel = "info",
): void => {
  Sentry.captureMessage(message, level);
};

/**
 * 현재 유저 정보를 Sentry에 등록
 */
export const setSentryUser = (
  user: {
    id: string;
    email?: string;
    username?: string;
  } | null,
): void => {
  Sentry.setUser(user);
};

/**
 * 유저 정보 초기화 (로그아웃 시 호출)
 */
export const clearSentryUser = (): void => {
  Sentry.setUser(null);
};
