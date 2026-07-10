import type { RefObject } from "react";
import { useLayoutEffect, useState } from "react";

interface MenuPosition {
	top: number;
	left: number;
	minWidth: number;
}

// 메뉴가 뷰포트 밖으로 나가지 않도록 두는 최소 여백(px), 위치 측정 전 화면 밖에 그려둘 임시 좌표
const VIEWPORT_MARGIN_PX = 8;
const OFFSCREEN_PX = -9999;

// 스크롤 컨테이너(overflow-auto 등) 안에서 document.body에 포털로 렌더링되는 플로팅 메뉴의
// 위치를 트리거 버튼 좌표 기준으로 계산한다. 좌우는 뷰포트를 넘지 않도록 당기고,
// 아래쪽 공간이 부족하면 위로 펼치는 방향으로 뒤집는다. 브라우저가 그리기 전(useLayoutEffect)에
// 재배치해야 화면 밖 임시 좌표가 잠깐이라도 보이지 않는다.
const useDropdownPosition = (
	isOpen: boolean,
	triggerRef: RefObject<HTMLDivElement | null>,
	menuRef: RefObject<HTMLDivElement | null>,
): MenuPosition => {
	const [position, setPosition] = useState<MenuPosition>({
		top: OFFSCREEN_PX,
		left: OFFSCREEN_PX,
		minWidth: 0,
	});

	useLayoutEffect(() => {
		if (!isOpen || !triggerRef.current) return;

		const updatePosition = (): void => {
			if (!triggerRef.current) return;
			const rect = triggerRef.current.getBoundingClientRect();
			const menuWidth = menuRef.current?.offsetWidth ?? rect.width;
			const menuHeight = menuRef.current?.offsetHeight ?? 0;
			const left = Math.min(
				rect.left,
				window.innerWidth - menuWidth - VIEWPORT_MARGIN_PX,
			);

			// 아래로 펼칠 공간이 부족하고 위로 펼칠 공간은 충분하면 버튼 위쪽으로 방향을 뒤집는다
			const spaceBelow = window.innerHeight - rect.bottom;
			const shouldOpenUpward =
				spaceBelow < menuHeight + VIEWPORT_MARGIN_PX &&
				rect.top > menuHeight + VIEWPORT_MARGIN_PX;
			const top = shouldOpenUpward
				? rect.top - menuHeight - 4
				: rect.bottom + 4;

			setPosition({
				top,
				left: Math.max(VIEWPORT_MARGIN_PX, left),
				minWidth: rect.width,
			});
		};

		updatePosition();
		window.addEventListener("resize", updatePosition);
		// 캡처 단계로 등록해야 상위의 어떤 스크롤 컨테이너가 스크롤되든 감지 가능
		window.addEventListener("scroll", updatePosition, true);

		return () => {
			window.removeEventListener("resize", updatePosition);
			window.removeEventListener("scroll", updatePosition, true);
		};
	}, [isOpen, triggerRef, menuRef]);

	return position;
};

export default useDropdownPosition;
export type { MenuPosition };
