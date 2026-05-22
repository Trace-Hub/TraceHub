import { svgStrokeProps } from "@/shared/lib/iconUtils";
import { cn } from "@/shared/lib/utils";

interface IconProps {
	className?: string;
	color?: string;
}

const SurfaceIcon = ({ className, color }: IconProps) => {
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
				d="M0 6.99975H4.6665M4.6665 6.99975C4.6665 6.38094 4.91232 5.78747 5.34989 5.3499C5.78746 4.91233 6.38093 4.6665 6.99975 4.6665C7.61857 4.6665 8.21204 4.91233 8.64961 5.3499C9.08718 5.78747 9.333 6.38094 9.333 6.99975M4.6665 6.99975C4.6665 7.61857 4.91232 8.21204 5.34989 8.64961C5.78746 9.08718 6.38093 9.333 6.99975 9.333C7.61857 9.333 8.21204 9.08718 8.64961 8.64961C9.08718 8.21204 9.333 7.61857 9.333 6.99975M9.333 6.99975H13.9995"
				{...svgStrokeProps(color)}
				strokeWidth="1.74994"
			/>
		</svg>
	);
};

export default SurfaceIcon;
