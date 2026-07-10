"use client";

import type { ReactElement } from "react";
import { createPortal } from "react-dom";
import useDropdown from "@/shared/hooks/useDropdown";
import useDropdownPosition from "@/shared/hooks/useDropdownPosition";
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
	const { isOpen, setIsOpen, containerRef, listboxRef, handleKeyDown } =
		useDropdown();
	// 대시보드 메인 영역(overflow-auto) 등 스크롤 컨테이너 안에 있으면 일반 absolute 배치는
	// 메뉴가 잘려 일부 옵션만 보이는 문제가 있어, 아래 렌더링에서 document.body에 포털로 그리고
	// 이 훅이 계산한 버튼 좌표 기준 fixed 위치를 사용한다
	const position = useDropdownPosition(isOpen, containerRef, listboxRef);

	const currentLabel = options.find((o) => o.value === value)?.label ?? value;

	return (
		<div
			ref={containerRef}
			className={cn("relative inline-block shrink-0", className)}
		>
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
					"text-body2 text-text-primary whitespace-nowrap",
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
			{isOpen &&
				createPortal(
					<div
						ref={listboxRef}
						role="listbox"
						aria-label={ariaLabel}
						style={{
							position: "fixed",
							top: position.top,
							left: position.left,
							minWidth: position.minWidth,
						}}
						className={cn(
							"z-50 w-max max-w-[calc(100vw-1rem)]",
							"rounded-md border border-border-base bg-bg-card shadow-md",
							"overflow-hidden",
						)}
					>
						{options.map((opt) => (
							<button
								key={opt.value}
								type="button"
								role="option"
								aria-selected={opt.value === value}
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
					</div>,
					document.body,
				)}
		</div>
	);
};

export default Dropdown;
export type { DropdownOption, DropdownProps };
