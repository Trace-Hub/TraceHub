"use client";

import type { ReactElement } from "react";
import { useEffect, useState } from "react";

interface CountdownTextProps {
	nextUpdateAt: number;
}

const formatCountdown = (ms: number): string => {
	const totalSeconds = Math.max(0, Math.ceil(ms / 1_000));
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	if (minutes > 0) return `${minutes}분 ${seconds}초 후 업데이트 예정`;
	return `${seconds}초 후 업데이트 예정`;
};

const CountdownText = ({ nextUpdateAt }: CountdownTextProps): ReactElement | null => {
	// SSR 시점과 클라이언트 hydration 시점의 Date.now()가 달라 텍스트가 불일치(hydration 실패)하므로
	// 초기값을 null로 두고 클라이언트 마운트 후에만 실제 시각을 읽는다
	const [now, setNow] = useState<number | null>(null);

	useEffect(() => {
		setNow(Date.now());
		const timer = setInterval(() => setNow(Date.now()), 1_000);
		return () => clearInterval(timer);
	}, []);

	if (now === null || now >= nextUpdateAt) return null;

	return (
		<span className="text-caption text-text-tertiary">
			{formatCountdown(nextUpdateAt - now)}
		</span>
	);
};

export default CountdownText;
