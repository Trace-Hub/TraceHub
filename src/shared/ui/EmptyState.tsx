import type { ReactElement } from "react"
import EmptyIcon from "@/shared/ui/icons/EmptyIcon"
import { cn } from "@/shared/lib/utils"

interface EmptyStateProps {
	message: string
	className?: string
	iconColor?: string
}

const EmptyState = ({ message, className, iconColor }: EmptyStateProps): ReactElement => {
	return (
		<div
			className={cn(
				"flex flex-col items-center justify-center gap-3 py-10",
				className,
			)}
		>
			<EmptyIcon color={iconColor} className="text-text-tertiary size-20" />
			<p className="text-body2 text-text-tertiary">{message}</p>
		</div>
	)
}

export default EmptyState
