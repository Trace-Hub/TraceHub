import type { ReactElement } from "react";
import type {
	LifecyclePeriod,
	LifecycleSegmentData,
	LifecycleSegmentKey,
} from "@/entities/event/model/lifecycle";
import {
	LIFECYCLE_ACTIVE_WINDOW,
	LIFECYCLE_TIER1_END,
	LIFECYCLE_TIER2_END,
} from "@/entities/event/model/lifecycle";
import AnimatedNumber from "@/shared/ui/AnimatedNumber";
import {
	ACTIVE_SEGMENT_KEYS,
	INACTIVE_SEGMENT_KEYS,
	SEGMENT_COLORS,
	SEGMENT_LABELS,
} from "@/views/posthog/model/lifecycleSegmentConfig";

interface LifecycleSegmentCardsProps {
	segments: LifecycleSegmentData[];
	period: LifecyclePeriod;
}

const getSegmentDescription = (
	key: LifecycleSegmentKey,
	period: LifecyclePeriod,
): string => {
	const w = LIFECYCLE_ACTIVE_WINDOW[period];
	const t1Start = w + 1;
	const t1End = LIFECYCLE_TIER1_END[period];
	const t2End = LIFECYCLE_TIER2_END[period];

	const descriptions: Record<LifecycleSegmentKey, string> = {
		new: `최근 ${w}일 내 첫 방문한 신규 사용자`,
		evaluating: `최근 ${w}일 내 2–3회 방문한 탐색 중 사용자`,
		engaged: `최근 ${w}일 내 4회 이상 방문한 핵심 사용자`,
		bounced: `1회 방문 후 ${t1Start}–${t1End}일 미방문 사용자`,
		lapsing: `다수 방문 후 ${t1Start}–${t1End}일 미방문 사용자`,
		disappearing: `${t1End + 1}–${t2End}일 비활성 사용자`,
	};

	return descriptions[key];
};

interface SegmentCardProps {
	data: LifecycleSegmentData;
	period: LifecyclePeriod;
}

const SegmentCard = ({ data, period }: SegmentCardProps): ReactElement => {
	const color = SEGMENT_COLORS[data.key];
	const label = SEGMENT_LABELS[data.key];
	const description = getSegmentDescription(data.key, period);

	return (
		<div className="flex flex-col gap-2 p-4 rounded-xl border border-border-subtle bg-bg-card">
			<div className="flex items-center gap-1.5">
				<span
					className="inline-block w-2 h-2 rounded-full shrink-0"
					style={{ backgroundColor: color }}
					aria-hidden="true"
				/>
				<span className="text-caption font-medium" style={{ color }}>
					{label}
				</span>
			</div>
			<span className="text-h1 font-bold text-text-primary">
				<AnimatedNumber
					value={data.count}
					format={(v) => `${Math.round(v).toLocaleString()}명`}
				/>
			</span>
			<span className="text-body2 font-medium text-text-secondary">
				{data.percentage.toFixed(1)}%
			</span>
			<p className="text-caption text-text-tertiary leading-snug">
				{description}
			</p>
		</div>
	);
};

const LifecycleSegmentCards = ({
	segments,
	period,
}: LifecycleSegmentCardsProps): ReactElement => {
	const byKey = Object.fromEntries(segments.map((s) => [s.key, s])) as Record<
		LifecycleSegmentKey,
		LifecycleSegmentData
	>;

	return (
		<div className="flex flex-col gap-3">
			{/* 활성 그룹 */}
			<div className="flex flex-col gap-2">
				<span className="text-caption text-text-tertiary font-medium uppercase tracking-widest">
					Active
				</span>
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
					{ACTIVE_SEGMENT_KEYS.map((key) => (
						<SegmentCard key={key} data={byKey[key]} period={period} />
					))}
				</div>
			</div>

			{/* 비활성 그룹 */}
			<div className="flex flex-col gap-2">
				<span className="text-caption text-text-tertiary font-medium uppercase tracking-widest">
					Inactive
				</span>
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
					{INACTIVE_SEGMENT_KEYS.map((key) => (
						<SegmentCard key={key} data={byKey[key]} period={period} />
					))}
				</div>
			</div>
		</div>
	);
};

export default LifecycleSegmentCards;
