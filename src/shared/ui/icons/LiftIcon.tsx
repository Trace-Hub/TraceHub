import { svgStrokeProps } from "@/shared/lib/iconUtils";
import { cn } from "@/shared/lib/utils";

interface IconProps {
	className?: string;
	color?: string;
}

const LiftIcon = ({ className, color }: IconProps) => {
	return (
		<svg
			width="14"
			height="14"
			viewBox="0 0 14 14"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={cn("shrink-0", className)}
			aria-hidden="true"
		>
			<path
				d="M10.4996 8.74988L6.99975 5.25L3.49988 8.74988"
				{...svgStrokeProps(color)}
				strokeWidth="1.16663"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
};

export default LiftIcon;
