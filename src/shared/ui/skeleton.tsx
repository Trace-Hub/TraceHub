import type { ReactElement } from "react";
import { cn } from "@/shared/lib/utils";

const Skeleton = ({
	className,
	...props
}: React.ComponentProps<"div">): ReactElement => (
	<div
		data-slot="skeleton"
		className={cn("animate-pulse rounded-md bg-bg-hover", className)}
		{...props}
	/>
);

export default Skeleton;
