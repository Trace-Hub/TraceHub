import type { ReactElement } from "react";
import { cn } from "@/shared/lib/utils";

function Skeleton({
	className,
	...props
}: React.ComponentProps<"div">): ReactElement {
	return (
		<div
			data-slot="skeleton"
			className={cn("animate-pulse rounded-md bg-bg-hover", className)}
			{...props}
		/>
	);
}

export { Skeleton };
