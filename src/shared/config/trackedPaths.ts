// 이벤트 대시보드에서 집계할 경로 목록
// - 경로 그대로: 해당 경로만 정확히 일치 (예: "/sentry-test")
// - /* 로 끝나면: 해당 경로와 모든 하위 경로 포함 (예: "/posthog/*" → /posthog, /posthog/1 ...)
// 새 서비스 경로 배포 시 이 파일에만 추가
export const TRACKED_PATHS = ["/sentry-test", "/posthog/*"] as const;
