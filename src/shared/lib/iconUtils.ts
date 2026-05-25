import { cn } from "@/shared/lib/utils";

export const iconClass = (className?: string): string =>
	cn(
		"flex flex-row items-center justify-center w-8 h-8 border-1 border-border-base rounded-sm",
		className,
	);

export const svgStrokeProps = (color?: string): { stroke: string } => ({
	stroke: color ?? "currentColor",
});
