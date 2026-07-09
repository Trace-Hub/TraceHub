const formatPct = (v: number): string => `${v.toFixed(1)}%`;

const formatCount = (v: number): string => Math.round(v).toLocaleString();

// "YYYY-MM-DD" → "M/D" (차트 X축 레이블용)
const formatShortDate = (isoDate: string): string => {
	const [, m, d] = isoDate.split("-");
	return `${parseInt(m, 10)}/${parseInt(d, 10)}`;
};

interface DurationParts {
	totalSeconds: number;
	minutes: number;
	remSeconds: number;
}

// ms를 분/초로 나누기 전에 반드시 총 초 단위로 먼저 반올림한다 — 분을 floor(seconds/60)로
// 구한 뒤 나머지 초를 따로 반올림하면 59.5~60초 같은 경계값이 "1분 0초"로 캐리되지 않고
// "0분 60초"로 잘못 표시된다. 언어·표기 형식이 다른 여러 duration 포맷터가 이 캐리 버그를
// 반복해서 만들 수 있어, 계산 자체를 공유해 한 곳에서만 관리한다
const splitDuration = (ms: number): DurationParts => {
	const totalSeconds = Math.round(ms / 1000);
	return {
		totalSeconds,
		minutes: Math.floor(totalSeconds / 60),
		remSeconds: totalSeconds % 60,
	};
};

export { formatCount, formatPct, formatShortDate, splitDuration };
