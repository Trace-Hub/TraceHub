import type { JSX } from "react"
import { cn } from "@/shared/lib/utils"

interface IconProps {
	className?: string
}

const THIcon = ({ className }: IconProps): JSX.Element => {
	return (
		<svg
			width="32"
			height="32"
			viewBox="0 0 32 32"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={cn("shrink-0", className)}
			aria-hidden="true"
		>
			<path
				d="M0 6C0 2.68629 2.68629 0 6 0H26C29.3137 0 32 2.68629 32 6V26C32 29.3137 29.3137 32 26 32H6C2.68629 32 0 29.3137 0 26V6Z"
				fill="#3B82F6"
			/>
			<path
				d="M5.13636 12.1307V10.3636H14.4205V12.1307H10.8239V22H8.73295V12.1307H5.13636ZM16.2102 22V10.3636H18.3182V15.2898H23.7102V10.3636H25.8239V22H23.7102V17.0568H18.3182V22H16.2102Z"
				fill="white"
			/>
		</svg>
	)
}

export default THIcon
