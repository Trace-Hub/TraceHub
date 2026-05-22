import TRACKING_EVENT from "@/shared/config/tracking";
import posthog from "posthog-js";

const trackEvent = (event: keyof typeof TRACKING_EVENT, properties?: Record<string, unknown>): void => {
    posthog.capture(TRACKING_EVENT[event], properties);
}

// $pageview는 PostHog 시스템 이벤트라 TRACKING_EVENT에서 분리하여 별도 래퍼로 관리
const trackPageview = (url: string): void => {
    posthog.capture("$pageview", { $current_url: url });
}

export { trackEvent, trackPageview };