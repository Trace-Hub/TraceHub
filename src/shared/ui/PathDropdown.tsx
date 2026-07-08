"use client";

import type { ReactElement } from "react";
import { TRACKED_PATHS } from "@/shared/config/trackedPaths";
import Dropdown from "@/shared/ui/Dropdown";

const PATH_OPTIONS: { value: string; label: string }[] = [
	{ value: "all", label: "전체 경로" },
	...TRACKED_PATHS.map((p) => ({ value: p, label: p })),
];

interface PathDropdownProps {
	value: string;
	onChange: (value: string) => void;
	className?: string;
}

const PathDropdown = ({
	value,
	onChange,
	className,
}: PathDropdownProps): ReactElement => (
	<Dropdown
		value={value}
		onChange={onChange}
		options={PATH_OPTIONS}
		ariaLabel="경로 선택"
		className={className}
	/>
);

export default PathDropdown;
