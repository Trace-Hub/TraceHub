"use client";

import type { ReactElement } from "react";
import type {
	LifecyclePeriod,
	LifecycleSegmentData,
	LifecycleTab,
} from "@/entities/event/model/lifecycle";
import { LIFECYCLE_ACTIVE_WINDOW } from "@/entities/event/model/lifecycle";
import { cn } from "@/shared/lib/utils";
import AnimatedNumber from "@/shared/ui/AnimatedNumber";
import {
	ACTIVE_SEGMENT_KEYS,
	SEGMENT_COLORS,
	SEGMENT_LABELS,
} from "@/widgets/posthog/lifecycle/model/lifecycleSegmentConfig";

interface LifecycleActiveSectionProps {
	activeCount: number;
	previousActiveCount: number;
	segments: LifecycleSegmentData[];
	period: LifecyclePeriod;
	activeTab: LifecycleTab;
	onTabChange: (tab: LifecycleTab) => void;
}

const LIFECYCLE_TABS: LifecycleTab[] = ["7일", "30일"];

const LifecycleActiveSection = ({
	activeCount,
	previousActiveCount,
	segments,
	period,
	activeTab,
	onTabChange,
}: LifecycleActiveSectionProps): ReactElement => {
	const activeWindow = LIFECYCLE_ACTIVE_WINDOW[period];
	const safeActive = activeCount === 0 ? 1 : activeCount;

	const changeRate =
		previousActiveCount === 0
			? null
			: ((activeCount - previousActiveCount) / previousActiveCount) * 100;

	const isPositive = changeRate !== null && changeRate > 0;
	const isNegative = changeRate !== null && changeRate < 0;

	const activeSegments = segments.filter((s) =>
		ACTIVE_SEGMENT_KEYS.includes(s.key),
	);

	return (
		<div className="rounded-xl border border-border-subtle bg-bg-card p-5 flex flex-col gap-4">
			{/* 헤더 행: 레이블 + 탭 선택 */}
			<div className="flex items-start justify-between gap-4">
				<div className="flex flex-col gap-0.5">
					<span className="text-body1 font-medium text-text-primary">
						Active User Base
					</span>
					<div className="flex items-center gap-1.5">
						<span className="text-caption text-text-tertiary">
							Active within the last
						</span>
						<div
							role="tablist"
							aria-label="활성 기간 선택"
							className="inline-flex items-center gap-0.5 bg-bg-subtle rounded-md p-0.5"
						>
							{LIFECYCLE_TABS.map((tab) => (
								<button
									key={tab}
									role="tab"
									type="button"
									aria-selected={activeTab === tab}
									onClick={() => onTabChange(tab)}
									className={cn(
										"px-2.5 py-1 rounded text-caption font-medium transition-[background-color,color] duration-150",
										activeTab === tab
											? "bg-bg-card text-text-primary shadow-sm"
											: "text-text-tertiary hover:text-text-secondary",
									)}
								>
									{tab}
								</button>
							))}
						</div>
					</div>
				</div>

				{/* 우측: 유저 수 + 증감률 */}
				<div className="flex flex-col items-end gap-0.5 shrink-0">
					<span className="text-caption text-text-tertiary">User Count</span>
					<span className="text-display font-bold text-text-primary">
						<AnimatedNumber
							value={activeCount}
							format={(v) => `${Math.round(v).toLocaleString()}명`}
						/>
					</span>
					{changeRate !== null && (
						<span
							className="text-caption font-medium"
							style={{
								color: isPositive
									? "var(--color-success)"
									: isNegative
										? "var(--color-error)"
										: "var(--color-text-tertiary)",
							}}
						>
							{isPositive ? "+" : ""}
							{changeRate.toFixed(1)}%, 이전 {activeWindow}일 대비
						</span>
					)}
					{changeRate === null && previousActiveCount === 0 && (
						<span className="text-caption text-text-tertiary">
							이전 데이터 없음
						</span>
					)}
				</div>
			</div>

			{/* 활성 사용자 세그먼트 수평 바 */}
			{activeCount > 0 && (
				<div className="flex flex-col gap-2">
					<div className="flex rounded-md overflow-hidden h-6">
						{activeSegments.map((seg) => {
							const widthPct = (seg.count / safeActive) * 100;
							if (widthPct < 0.5) return null;
							return (
								<div
									key={seg.key}
									className="flex items-center justify-center min-w-0 overflow-hidden"
									style={{
										width: `${widthPct}%`,
										backgroundColor: SEGMENT_COLORS[seg.key],
										opacity: 0.85,
									}}
									aria-hidden="true"
								/>
							);
						})}
					</div>
					{/* 레전드 */}
					<div className="flex items-center gap-4 flex-wrap">
						{activeSegments.map((seg) => (
							<div key={seg.key} className="flex items-center gap-1.5">
								<span
									className="inline-block w-2 h-2 rounded-full shrink-0"
									style={{ backgroundColor: SEGMENT_COLORS[seg.key] }}
									aria-hidden="true"
								/>
								<span className="text-caption text-text-secondary">
									{SEGMENT_LABELS[seg.key]}
								</span>
								<span className="text-caption text-text-tertiary">
									{seg.count}명
								</span>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default LifecycleActiveSection;
