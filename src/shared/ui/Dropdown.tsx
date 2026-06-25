"use client";

import type { ReactElement } from "react";
import useDropdown from "@/shared/hooks/useDropdown";
import { cn } from "@/shared/lib/utils";
import DropIcon from "@/shared/ui/icons/DropIcon";

interface DropdownOption<T extends string> {
	value: T;
	label: string;
}

interface DropdownProps<T extends string> {
	value: T;
	onChange: (value: T) => void;
	options: DropdownOption<T>[];
	ariaLabel: string;
	className?: string;
}

const Dropdown = <T extends string>({
	value,
	onChange,
	options,
	ariaLabel,
	className,
}: DropdownProps<T>): ReactElement => {
	const { isOpen, setIsOpen, containerRef, handleKeyDown } = useDropdown();

	const currentLabel = options.find((o) => o.value === value)?.label ?? value;

	return (
		<div ref={containerRef} className={cn("relative inline-block", className)}>
			<button
				type="button"
				onClick={() => setIsOpen((prev) => !prev)}
				onKeyDown={handleKeyDown}
				aria-haspopup="listbox"
				aria-expanded={isOpen}
				aria-label={ariaLabel}
				className={cn(
					"flex items-center gap-1.5",
					"pl-2.5 pr-2 py-1",
					"rounded-md border border-border-base bg-bg-card",
					"text-body2 text-text-primary",
					"cursor-pointer outline-none",
					"focus:border-border-focus transition-colors duration-150",
				)}
			>
				<span>{currentLabel}</span>
				<DropIcon
					color="var(--color-text-tertiary)"
					className={cn(
						"transition-transform duration-150",
						isOpen && "rotate-180",
					)}
				/>
			</button>
			{isOpen && (
				<div
					className={cn(
						"absolute left-0 top-full mt-1 z-50",
						"min-w-full w-max",
						"rounded-md border border-border-base bg-bg-card shadow-md",
						"overflow-hidden",
					)}
				>
					{options.map((opt) => (
						<button
							key={opt.value}
							type="button"
							onKeyDown={handleKeyDown}
							onClick={() => {
								onChange(opt.value);
								setIsOpen(false);
							}}
							className={cn(
								"w-full text-left px-3 py-1.5 text-body2 cursor-pointer",
								"text-text-primary hover:bg-bg-hover transition-colors duration-100",
								opt.value === value && "text-primary font-medium",
							)}
						>
							{opt.label}
						</button>
					))}
				</div>
			)}
		</div>
	);
};

export default Dropdown;
export type { DropdownOption, DropdownProps };
