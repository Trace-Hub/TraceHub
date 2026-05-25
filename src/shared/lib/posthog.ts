import posthog from "posthog-js";
import type { Period } from "@/entities/event/model/eventStats";
import TRACKING_EVENT from "@/shared/config/tracking";

const POSTHOG_APP_HOST = process.env.NEXT_PUBLIC_POSTHOG_APP_HOST;
const POSTHOG_PROJECT_ID = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_ID;

const trackEvent = (
	event: keyof typeof TRACKING_EVENT,
	properties?: Record<string, unknown>,
): void => {
	posthog.capture(TRACKING_EVENT[event], properties);
};

// $pageview는 PostHog 시스템 이벤트라 TRACKING_EVENT에서 분리하여 별도 래퍼로 관리
const trackPageview = (url: string): void => {
	posthog.capture("$pageview", { $current_url: url });
};

const PERIOD_TO_AFTER: Record<Period, string> = {
	day: "-24h",
	week: "-7d",
	month: "-30d",
};

const buildPostHogEventUrl = (event: string, period: Period = "day"): string => {
	if (!POSTHOG_APP_HOST || !POSTHOG_PROJECT_ID) return "";
	const query = encodeURIComponent(
		JSON.stringify({
			kind: "DataTableNode",
			full: true,
			source: {
				kind: "EventsQuery",
				select: [
					"*",
					"event",
					"person_display_name -- Person",
					"coalesce(properties.$current_url, properties.$screen_name) -- Url / Screen",
					"properties.$lib",
					"timestamp",
				],
				orderBy: ["timestamp DESC"],
				after: PERIOD_TO_AFTER[period],
				filterTestAccounts: false,
				event,
			},
			propertiesViaUrl: true,
			showSavedQueries: true,
			showPersistentColumnConfigurator: true,
			showPropertyFilter: true,
		}),
	);
	return `${POSTHOG_APP_HOST}/project/${POSTHOG_PROJECT_ID}/activity/explore#q=${query}`;
}

export { buildPostHogEventUrl, trackEvent, trackPageview };
