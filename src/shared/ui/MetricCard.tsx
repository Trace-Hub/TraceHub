import type { ReactElement } from "react"
import { cn } from "@/shared/lib/utils"
import AnimatedNumber from "@/shared/ui/AnimatedNumber"
import ChangeRateBadge from "@/shared/ui/ChangeRateBadge"

// NOTE(재사용 권장):
//   src/shared/ui/StatsRow 는 인라인 텍스트 형식이라 용도가 다르지만,
//   두 컴포넌트의 역할이 겹치게 되면 통합·정리 검토를 권장한다.

interface MetricCardProps {
	label: string
	value: number | undefined
	format: (v: number) => string
	changeRate?: number
	previousValue?: number
	previousFormat?: (v: number) => string
	className?: string
}

const MetricCard = ({
	label,
	value,
	format,
	changeRate,
	previousValue,
	previousFormat,
	className,
}: MetricCardProps): ReactElement => {
	const hasValue = value !== undefined
	const hasPrevious = previousValue !== undefined && previousFormat !== undefined

	return (
		<div
			className={cn(
				"flex flex-col gap-1 p-4 rounded-xl border border-border-subtle bg-bg-card",
				className,
			)}
		>
			<span className="text-caption text-text-tertiary">{label}</span>
			<div className="flex items-center justify-between">
				<span className="text-h1 font-bold text-text-primary">
					{hasValue ? <AnimatedNumber value={value} format={format} /> : "-"}
				</span>
				{hasValue && changeRate !== undefined && (
					<ChangeRateBadge value={changeRate} />
				)}
			</div>
			{hasPrevious ? (
				<AnimatedNumber
					value={previousValue}
					format={previousFormat}
					className="text-caption text-text-tertiary"
				/>
			) : (
				<span className="text-caption text-text-tertiary">-</span>
			)}
		</div>
	)
}

export default MetricCard
