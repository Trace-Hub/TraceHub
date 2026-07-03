import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { apiClient } from "@/shared/api/client";

interface ConnectionTestResponse {
  connected: boolean;
  reason?: "env_missing" | "invalid_token" | "api_error";
}

const REASON_MESSAGES: Record<string, string> = {
  env_missing: "환경변수가 설정되지 않았습니다.",
  invalid_token: "API 토큰이 유효하지 않습니다.",
  api_error: "API 연결에 실패했습니다.",
};

/**
 * 메인 대시보드 마운트 시 Sentry/PostHog 연결 상태를 확인하고
 * 연결 실패 시 토스트 알림을 표시하는 훅
 */
const useConnectionCheck = (): void => {
  const checked = useRef(false);

  useEffect(() => {
    // 중복 실행 방지 (StrictMode 대응)
    if (checked.current) return;
    checked.current = true;

    const checkConnections = async (): Promise<void> => {
      const [sentryRes, posthogRes] = await Promise.allSettled([
        apiClient("/api/sentry/test").then(
          (r) => r.json() as Promise<ConnectionTestResponse>,
        ),
        apiClient("/api/posthog/test").then(
          (r) => r.json() as Promise<ConnectionTestResponse>,
        ),
      ]);

      if (sentryRes.status === "fulfilled" && !sentryRes.value.connected) {
        const reason =
          REASON_MESSAGES[sentryRes.value.reason ?? ""] ??
          "연결에 실패했습니다.";
        toast.error(`Sentry 연동 실패: ${reason}`, {
          description: "Settings에서 연동 설정을 확인하세요.",
          duration: 5000,
        });
      }

      if (posthogRes.status === "fulfilled" && !posthogRes.value.connected) {
        const reason =
          REASON_MESSAGES[posthogRes.value.reason ?? ""] ??
          "연결에 실패했습니다.";
        toast.error(`PostHog 연동 실패: ${reason}`, {
          description: "Settings에서 연동 설정을 확인하세요.",
          duration: 5000,
        });
      }
    };

    checkConnections();
  }, []);
};

export default useConnectionCheck;
