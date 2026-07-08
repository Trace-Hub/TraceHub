"use client";

import type { ReactElement } from "react";
import type { FunnelStepResult } from "@/entities/event/model/funnel";

interface FunnelVisualChartProps {
	steps: FunnelStepResult[];
}

const FunnelVisualChart = ({ steps }: FunnelVisualChartProps): ReactElement => {
	return (
		<figure className="flex flex-col gap-3 m-0" aria-label="퍼널 시각화">
			{steps.map((step) => {
				// 전환율에 비례한 너비로 중앙 정렬 → 위가 넓고 아래로 갈수록 좁아지는 깔때기 형태
				const widthPct = Math.max(step.conversionRate, 8);

				return (
					<div key={step.event} className="flex items-center gap-2">
						<div className="flex-1 flex justify-center">
							<div
								role="progressbar"
								aria-label={step.label}
								aria-valuenow={step.conversionRate}
								aria-valuemin={0}
								aria-valuemax={100}
								className="h-9 rounded-md transition-[width] duration-700 ease-out"
								style={{
									width: `${widthPct}%`,
									backgroundColor: step.color,
								}}
							/>
						</div>
						<span className="text-caption text-text-tertiary w-10 shrink-0 text-right">
							{step.conversionRate.toFixed(1)}%
						</span>
					</div>
				);
			})}
		</figure>
	);
};

export default FunnelVisualChart;
