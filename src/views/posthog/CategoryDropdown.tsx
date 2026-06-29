"use client";

import type { ReactElement } from "react";
import type { EventCategory } from "@/entities/event/model/eventCategory";
import { EVENT_CATEGORY_LABELS } from "@/entities/event/model/eventCategory";
import Dropdown from "@/shared/ui/Dropdown";

const CATEGORY_OPTIONS: { value: EventCategory; label: string }[] = [
	{ value: "all", label: EVENT_CATEGORY_LABELS.all },
	{ value: "navigation", label: EVENT_CATEGORY_LABELS.navigation },
	{ value: "interaction", label: EVENT_CATEGORY_LABELS.interaction },
	{ value: "system", label: EVENT_CATEGORY_LABELS.system },
];

interface CategoryDropdownProps {
	value: EventCategory;
	onChange: (value: EventCategory) => void;
	className?: string;
}

const CategoryDropdown = ({
	value,
	onChange,
	className,
}: CategoryDropdownProps): ReactElement => (
	<Dropdown
		value={value}
		onChange={onChange}
		options={CATEGORY_OPTIONS}
		ariaLabel="카테고리 선택"
		className={className}
	/>
);

export default CategoryDropdown;
