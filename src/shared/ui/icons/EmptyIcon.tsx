import type { JSX } from "react"
import { svgStrokeProps } from "@/shared/lib/iconUtils"
import { cn } from "@/shared/lib/utils"

interface IconProps {
	className?: string
	color?: string
}

const EmptyIcon = ({ className, color }: IconProps): JSX.Element => {
	return (
		<svg
			width="80"
			height="80"
			viewBox="0 0 80 80"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={cn("shrink-0", className)}
			aria-hidden="true"
		>
			<rect
				x="10"
				y="20"
				width="60"
				height="46"
				rx="4"
				{...svgStrokeProps(color)}
				strokeWidth="2.5"
				strokeLinejoin="round"
			/>
			<path
				d="M10 34H30L35 20H10V34Z"
				{...svgStrokeProps(color)}
				strokeWidth="2.5"
				strokeLinejoin="round"
			/>
			<path
				d="M70 34H50L45 20H70V34Z"
				{...svgStrokeProps(color)}
				strokeWidth="2.5"
				strokeLinejoin="round"
			/>
			<line
				x1="28"
				y1="52"
				x2="52"
				y2="52"
				{...svgStrokeProps(color)}
				strokeWidth="2.5"
				strokeLinecap="round"
			/>
			<line
				x1="33"
				y1="60"
				x2="47"
				y2="60"
				{...svgStrokeProps(color)}
				strokeWidth="2.5"
				strokeLinecap="round"
			/>
		</svg>
	)
}

export default EmptyIcon