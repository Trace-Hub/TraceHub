import TRACKING_EVENT from "@/shared/config/tracking";
import posthog from "posthog-js";

const trackEvent = (event: keyof typeof TRACKING_EVENT, properties?: Record<string, unknown>) => {
    posthog.capture(TRACKING_EVENT[event], properties);
}

export {trackEvent};