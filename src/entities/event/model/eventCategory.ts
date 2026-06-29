type EventCategory = "all" | "navigation" | "interaction" | "system";

const NAVIGATION_EVENTS = new Set(["$pageview", "$pageleave", "link_clicked"]);
const INTERACTION_EVENTS = new Set([
	"button_clicked",
	"tab_changed",
	"input_focus",
	"form_submitted",
]);

const EVENT_CATEGORY_LABELS: Record<EventCategory, string> = {
	all: "이벤트 전체",
	navigation: "내비게이션",
	interaction: "인터랙션",
	system: "시스템",
};

const classifyEvent = (event: string): EventCategory => {
	if (NAVIGATION_EVENTS.has(event)) return "navigation";
	if (INTERACTION_EVENTS.has(event)) return "interaction";
	// $ 접두사 이벤트 중 내비게이션에 속하지 않는 것 (autocapture, identify 등)
	if (event.startsWith("$")) return "system";
	// 분류되지 않은 커스텀 이벤트 — "all" 탭에서만 노출됨
	return "all";
};

const filterEventsByCategory = <T extends { event: string }>(
	events: T[],
	category: EventCategory,
): T[] => {
	if (category === "all") return events;
	return events.filter((e) => classifyEvent(e.event) === category);
};

export type { EventCategory };
export { EVENT_CATEGORY_LABELS, filterEventsByCategory };
