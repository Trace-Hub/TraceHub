import type { ReactElement } from "react";
import type { LifecycleSegmentData } from "@/entities/event/model/lifecycle";
import {
	SEGMENT_COLORS,
	SEGMENT_LABELS,
} from "@/views/posthog/model/lifecycleSegmentConfig";

interface LifecycleTotalChartProps {
	segments: LifecycleSegmentData[];
	totalCount: number;
}

const LifecycleTotalChart = ({
	segments,
	totalCount,
}: LifecycleTotalChartProps): ReactElement => {
	// 최대값 기준으로 바 너비를 정규화 — 가장 큰 세그먼트가 100%
	const maxCount = Math.max(...segments.map((s) => s.count), 1);

	return (
		<div className="rounded-xl border border-border-subtle bg-bg-card p-5 flex flex-col gap-4">
			<div className="flex items-center justify-between">
				<span className="text-body1 font-medium text-text-primary">
					전체 사용자 분포
				</span>
				<span className="text-caption text-text-tertiary">
					총 {totalCount.toLocaleString()}명
				</span>
			</div>

			<div className="flex flex-col gap-3">
				{segments.map((seg) => {
					const barWidth = (seg.count / maxCount) * 100;

					return (
						<div key={seg.key} className="flex items-center gap-3">
							{/* 레이블 */}
							<span
								className="text-caption font-medium w-24 shrink-0"
								style={{ color: SEGMENT_COLORS[seg.key] }}
							>
								{SEGMENT_LABELS[seg.key]}
							</span>

							{/* 바 */}
							<div className="flex-1 h-2 rounded-full bg-bg-overlay overflow-hidden">
								<div
									className="h-full rounded-full transition-[width] duration-700 ease-out"
									style={{
										width: `${barWidth}%`,
										backgroundColor: SEGMENT_COLORS[seg.key],
										opacity: 0.85,
									}}
								/>
							</div>

							{/* 수치 */}
							<div className="flex items-center gap-1.5 w-28 shrink-0 justify-end">
								<span className="text-body2 font-medium text-text-primary tabular-nums">
									{seg.count.toLocaleString()}명
								</span>
								<span className="text-caption text-text-tertiary tabular-nums">
									({seg.percentage.toFixed(1)}%)
								</span>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default LifecycleTotalChart;
