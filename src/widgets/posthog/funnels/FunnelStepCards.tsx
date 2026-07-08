"use client";

import type { ReactElement } from "react";
import type { FunnelStepResult } from "@/entities/event/model/funnel";
import { formatCount, formatPct } from "@/shared/lib/formatters";
import AnimatedNumber from "@/shared/ui/AnimatedNumber";

interface FunnelStepCardsProps {
	steps: FunnelStepResult[];
}

const FunnelStepCards = ({ steps }: FunnelStepCardsProps): ReactElement => {
	const maxCount = steps[0]?.count ?? 0;

	return (
		<div className="flex flex-col gap-3">
			{steps.map((step, i) => {
				const widthPct = maxCount > 0 ? (step.count / maxCount) * 100 : 0;

				return (
					<div
						key={step.event}
						className="flex flex-col gap-2 p-4 rounded-xl border border-border-subtle bg-bg-card"
					>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								{/* 단계 번호 뱃지 */}
								<span
									className="flex items-center justify-center w-5 h-5 rounded-full text-white text-label font-bold shrink-0"
									style={{ backgroundColor: step.color }}
								>
									{i + 1}
								</span>
								<span className="text-body2 font-medium text-text-primary">
									{step.label}
								</span>
							</div>
							<div className="flex items-center gap-3">
								{i > 0 && (
									<span className="text-caption text-error">
										↓ {formatPct(step.dropoffRate)} 이탈
									</span>
								)}
								<span className="text-body2 font-bold text-text-primary">
									<AnimatedNumber value={step.count} format={formatCount} />
								</span>
								<span className="text-caption text-text-tertiary w-12 text-right">
									{formatPct(step.conversionRate)}
								</span>
							</div>
						</div>

						{/* 단계별 진행 바 */}
						<div className="h-1.5 rounded-full bg-bg-hover overflow-hidden">
							<div
								className="h-full rounded-full transition-[width] duration-700 ease-out"
								style={{ width: `${widthPct}%`, backgroundColor: step.color }}
							/>
						</div>
					</div>
				);
			})}
		</div>
	);
};

export default FunnelStepCards;
