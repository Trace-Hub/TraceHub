type EventCategory = "all" | "navigation" | "interaction" | "system";

// 서버(HogQL 쿼리 빌더)에서도 카테고리→이벤트 IN 조건을 만들 때 재사용하므로 export
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

export type { EventCategory };
export { EVENT_CATEGORY_LABELS, INTERACTION_EVENTS, NAVIGATION_EVENTS };
