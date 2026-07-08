"use client";

import type { ReactElement } from "react";
import type { Period } from "@/shared/ui/PeriodTab";
import Dropdown from "@/shared/ui/Dropdown";

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
	{ value: "오늘", label: "오늘" },
	{ value: "7일", label: "최근 7일" },
	{ value: "30일", label: "최근 30일" },
];

interface PeriodDropdownProps {
	value: Period;
	onChange: (value: Period) => void;
	className?: string;
}

const PeriodDropdown = ({
	value,
	onChange,
	className,
}: PeriodDropdownProps): ReactElement => (
	<Dropdown
		value={value}
		onChange={onChange}
		options={PERIOD_OPTIONS}
		ariaLabel="기간 선택"
		className={className}
	/>
);

export default PeriodDropdown;
