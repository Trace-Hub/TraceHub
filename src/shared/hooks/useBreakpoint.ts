import { useEffect, useState } from "react";

type Breakpoint = "mobile" | "tablet" | "desktop";

// src/styles/globals.css의 --breakpoint-sm(640px)/--breakpoint-lg(1280px)와 동일한 값을 유지해야 함
const BREAKPOINT_SM_PX = 640;
const BREAKPOINT_LG_PX = 1280;

const getBreakpoint = (width: number): Breakpoint => {
	if (width >= BREAKPOINT_LG_PX) return "desktop";
	if (width >= BREAKPOINT_SM_PX) return "tablet";
	return "mobile";
};

// SSR에서는 뷰포트를 알 수 없어 "desktop" 기본값으로 시작하고,
// 마운트 후 실제 너비로 갱신 — 초기값을 고정해야 하이드레이션 불일치가 발생하지 않음
const useBreakpoint = (): Breakpoint => {
	const [breakpoint, setBreakpoint] = useState<Breakpoint>("desktop");

	useEffect(() => {
		const update = (): void => {
			setBreakpoint(getBreakpoint(window.innerWidth));
		};

		update();
		window.addEventListener("resize", update);

		return () => window.removeEventListener("resize", update);
	}, []);

	return breakpoint;
};

export default useBreakpoint;
export type { Breakpoint };
