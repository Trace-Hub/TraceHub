import type { KeyboardEvent } from "react";
import { useEffect, useRef, useState } from "react";

interface UseDropdownReturn {
	isOpen: boolean;
	setIsOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
	containerRef: React.RefObject<HTMLDivElement | null>;
	handleKeyDown: (e: KeyboardEvent) => void;
}

const useDropdown = (): UseDropdownReturn => {
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleOutside = (e: MouseEvent) => {
			// MouseEvent.target은 EventTarget 타입이므로 containment 체크 전에 Node 가드 필요
			if (!(e.target instanceof Node)) return;
			if (containerRef.current && !containerRef.current.contains(e.target)) {
				setIsOpen(false);
			}
		};
		document.addEventListener("mousedown", handleOutside);
		return () => document.removeEventListener("mousedown", handleOutside);
	}, []);

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === "Escape") setIsOpen(false);
	};

	return { isOpen, setIsOpen, containerRef, handleKeyDown };
};

export default useDropdown;
