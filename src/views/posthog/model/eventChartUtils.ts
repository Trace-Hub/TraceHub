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

const buildNormalizedData = (events: EventStats[]): Record<string, string | number>[] => {
	const breakdown = events[0]?.breakdown ?? [];

	// 이벤트별 베이스라인을 미리 계산 — 슬롯 루프 안에서 findIndex가 반복 실행되지 않도록
	// 첫 비제로 슬롯을 베이스라인으로 사용해 데이터 이전 슬롯이 -100%로 계산되는 것을 방지
	const baselines = events.map((ev) => {
		const baseIndex = ev.breakdown.findIndex((slot) => slot.count > 0);
		return {
			baseIndex,
			baseCount: baseIndex >= 0 ? ev.breakdown[baseIndex].count : 0,
		};
	});

	return breakdown.map((b, i) => {
		const point: Record<string, string | number> = { label: b.label };
		for (let j = 0; j < events.length; j++) {
			const ev = events[j];
			const { baseIndex, baseCount } = baselines[j];
			const currentCount = ev.breakdown[i]?.count ?? 0;
			if (baseCount === 0 || i < baseIndex) {
				point[ev.event] = 0;
			} else {
				point[ev.event] = Math.round(((currentCount - baseCount) / baseCount) * 100);
			}
		}
		return point;
	});
};

export { buildCountData, buildNormalizedData };
