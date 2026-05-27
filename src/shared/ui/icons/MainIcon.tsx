import type { JSX } from "react"
import { svgStrokeProps } from "@/shared/lib/iconUtils"
import { cn } from "@/shared/lib/utils"

interface IconProps {
	className?: string
	color?: string
}

const MainIcon = ({ className, color }: IconProps): JSX.Element => {
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
				d="M7.49415 2.49805H3.33073C2.87085 2.49805 2.49805 2.87085 2.49805 3.33073V7.49415C2.49805 7.95402 2.87085 8.32683 3.33073 8.32683H7.49415C7.95402 8.32683 8.32683 7.95402 8.32683 7.49415V3.33073C8.32683 2.87085 7.95402 2.49805 7.49415 2.49805Z"
				{...svgStrokeProps(color)}
				strokeWidth="1.66537"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M16.6536 2.49805H12.4902C12.0303 2.49805 11.6575 2.87085 11.6575 3.33073V7.49415C11.6575 7.95402 12.0303 8.32683 12.4902 8.32683H16.6536C17.1134 8.32683 17.4863 7.95402 17.4863 7.49415V3.33073C17.4863 2.87085 17.1134 2.49805 16.6536 2.49805Z"
				{...svgStrokeProps(color)}
				strokeWidth="1.66537"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M16.6536 11.6577H12.4902C12.0303 11.6577 11.6575 12.0305 11.6575 12.4904V16.6538C11.6575 17.1137 12.0303 17.4865 12.4902 17.4865H16.6536C17.1134 17.4865 17.4863 17.1137 17.4863 16.6538V12.4904C17.4863 12.0305 17.1134 11.6577 16.6536 11.6577Z"
				{...svgStrokeProps(color)}
				strokeWidth="1.66537"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M7.49415 11.6577H3.33073C2.87085 11.6577 2.49805 12.0305 2.49805 12.4904V16.6538C2.49805 17.1137 2.87085 17.4865 3.33073 17.4865H7.49415C7.95402 17.4865 8.32683 17.1137 8.32683 16.6538V12.4904C8.32683 12.0305 7.95402 11.6577 7.49415 11.6577Z"
				{...svgStrokeProps(color)}
				strokeWidth="1.66537"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	)
}

export default MainIcon