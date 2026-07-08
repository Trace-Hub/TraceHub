import type { EventStats } from "@/entities/event/model/eventStats";

const buildCountData = (events: EventStats[]): Record<string, string | number>[] => {
	const breakdown = events[0]?.breakdown ?? [];
	return breakdown.map((b, i) => {
		const point: Record<string, string | number> = { label: b.label };
		for (const ev of events) {
			point[ev.event] = ev.breakdown[i]?.count ?? 0;
		}
		return point;
	});
};

export { buildCountData };
