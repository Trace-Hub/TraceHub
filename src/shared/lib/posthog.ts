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

// day: "dStart" = 오늘 자정부터 (HogQL의 toDate(timestamp) = today()와 동일한 기준)
// "-24h"는 현재 기준 24시간 전이라 캘린더 기준 "오늘"과 불일치함
const PERIOD_TO_AFTER: Record<Period, string> = {
	day: "dStart",
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
