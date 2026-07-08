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
	const [now, setNow] = useState(() => Date.now());

	useEffect(() => {
		const timer = setInterval(() => setNow(Date.now()), 1_000);
		return () => clearInterval(timer);
	}, []);

	if (now >= nextUpdateAt) return null;

	return (
		<span className="text-caption text-text-tertiary">
			{formatCountdown(nextUpdateAt - now)}
		</span>
	);
};

export default CountdownText;
