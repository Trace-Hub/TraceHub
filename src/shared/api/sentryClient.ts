const SENTRY_HOST = "https://sentry.io";

interface SentryClientConfig {
  token: string;
  org: string;
  project?: string;
}

/**
 * Sentry 환경변수를 읽어 config 객체로 반환.
 * 필수 값이 없으면 null 반환.
 */
const getSentryConfig = (): SentryClientConfig | null => {
  const token = process.env.NEXT_SENTRY_API_TOKEN;
  const org = process.env.NEXT_SENTRY_ORG;
  const project = process.env.NEXT_SENTRY_PROJECT;

  if (!token || !org) return null;

  return { token, org, project };
};

/**
 * Sentry API 공용 fetch 래퍼.
 * Base URL, Authorization 헤더, 타임아웃을 공통 처리.
 */
const sentryFetch = async (
  path: string,
  config: SentryClientConfig,
  options?: { timeout?: number },
): Promise<Response> => {
  const timeout = options?.timeout ?? 10000;

  return fetch(`${SENTRY_HOST}${path}`, {
    headers: {
      Authorization: `Bearer ${config.token}`,
    },
    signal: AbortSignal.timeout(timeout),
  });
};

export { getSentryConfig, sentryFetch, SENTRY_HOST };
export type { SentryClientConfig };
