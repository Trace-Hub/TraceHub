import type { KeyboardEvent } from "react";
import { useEffect, useRef, useState } from "react";

interface UseDropdownReturn {
	isOpen: boolean;
	setIsOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
	containerRef: React.RefObject<HTMLDivElement | null>;
	listboxRef: React.RefObject<HTMLDivElement | null>;
	handleKeyDown: (e: KeyboardEvent) => void;
}

const useDropdown = (): UseDropdownReturn => {
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	// 메뉴를 document.body에 포털로 렌더링하는 경우 containerRef의 DOM 트리 밖에 위치하므로
	// "바깥 클릭" 판단 시 이 ref도 함께 확인해야 메뉴 클릭이 바깥 클릭으로 오인되지 않음
	const listboxRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleOutside = (e: MouseEvent) => {
			// MouseEvent.target은 EventTarget 타입이므로 containment 체크 전에 Node 가드 필요
			if (!(e.target instanceof Node)) return;
			const isInsideContainer =
				containerRef.current?.contains(e.target) ?? false;
			const isInsideListbox = listboxRef.current?.contains(e.target) ?? false;
			if (!isInsideContainer && !isInsideListbox) {
				setIsOpen(false);
			}
		};
		document.addEventListener("mousedown", handleOutside);
		return () => document.removeEventListener("mousedown", handleOutside);
	}, []);

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === "Escape") setIsOpen(false);
	};

	return { isOpen, setIsOpen, containerRef, listboxRef, handleKeyDown };
};

export default useDropdown;
