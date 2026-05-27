import type { JSX } from "react"
import { svgStrokeProps } from "@/shared/lib/iconUtils"
import { cn } from "@/shared/lib/utils"

interface IconProps {
	className?: string
	color?: string
}

const ErrorIcon = ({ className, color }: IconProps): JSX.Element => {
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
			<g clipPath="url(#clip_error_icon)">
				<path
					d="M9.99212 18.3192C14.5909 18.3192 18.319 14.5911 18.319 9.99236C18.319 5.39358 14.5909 1.66553 9.99212 1.66553C5.39333 1.66553 1.66528 5.39358 1.66528 9.99236C1.66528 14.5911 5.39333 18.3192 9.99212 18.3192Z"
					{...svgStrokeProps(color)}
					strokeWidth="1.66537"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M9.99219 6.66162V9.99235"
					{...svgStrokeProps(color)}
					strokeWidth="1.66537"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M9.99219 13.3228H10.0005"
					{...svgStrokeProps(color)}
					strokeWidth="1.66537"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</g>
			<defs>
				<clipPath id="clip_error_icon">
					<rect width="19.9844" height="19.9844" fill="white" />
				</clipPath>
			</defs>
		</svg>
	)
}

export default ErrorIcon