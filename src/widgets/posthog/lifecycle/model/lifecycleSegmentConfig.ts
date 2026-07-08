import type { LifecycleSegmentKey } from "@/entities/event/model/lifecycle";

const SEGMENT_COLORS: Record<LifecycleSegmentKey, string> = {
	new: "var(--color-primary)",
	evaluating: "var(--color-warning)",
	engaged: "var(--color-success)",
	bounced: "var(--color-surge)",
	lapsing: "var(--color-error)",
	disappearing: "var(--color-text-tertiary)",
};

const SEGMENT_LABELS: Record<LifecycleSegmentKey, string> = {
	new: "신규 사용자",
	evaluating: "탐색 사용자",
	engaged: "활성 사용자",
	bounced: "이탈 사용자",
	lapsing: "휴면 사용자",
	disappearing: "소멸 사용자",
};

const ACTIVE_SEGMENT_KEYS: LifecycleSegmentKey[] = [
	"new",
	"evaluating",
	"engaged",
];
const INACTIVE_SEGMENT_KEYS: LifecycleSegmentKey[] = [
	"bounced",
	"lapsing",
	"disappearing",
];

export {
	ACTIVE_SEGMENT_KEYS,
	INACTIVE_SEGMENT_KEYS,
	SEGMENT_COLORS,
	SEGMENT_LABELS,
};
