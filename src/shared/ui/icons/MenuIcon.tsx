import type { JSX } from "react"
import { svgStrokeProps } from "@/shared/lib/iconUtils"
import { cn } from "@/shared/lib/utils"

interface IconProps {
	className?: string
	color?: string
}

const MenuIcon = ({ className, color }: IconProps): JSX.Element => {
	return (
		<svg
			width="20"
			height="20"
			viewBox="0 0 20 20"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={cn("shrink-0", className)}
			aria-hidden="true"
		>
			<path
				d="M3.33073 9.99219H16.6537"
				{...svgStrokeProps(color)}
				strokeWidth="1.66537"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M3.33073 4.99609H16.6537"
				{...svgStrokeProps(color)}
				strokeWidth="1.66537"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M3.33073 14.9883H16.6537"
				{...svgStrokeProps(color)}
				strokeWidth="1.66537"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	)
}

export default MenuIcon