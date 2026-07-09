import type { JSX } from "react";
import { svgStrokeProps } from "@/shared/lib/iconUtils";
import { cn } from "@/shared/lib/utils";

interface IconProps {
	className?: string;
	color?: string;
}

const DropIcon = ({ className, color }: IconProps): JSX.Element => {
	return (
		<svg
			width="16"
			height="16"
			viewBox="0 0 16 16"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={cn("shrink-0", className)}
			aria-hidden="true"
		>
			<path
				d="M4 6L8 10L12 6"
				{...svgStrokeProps(color)}
				strokeWidth="1.33333"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
};

export default DropIcon;
