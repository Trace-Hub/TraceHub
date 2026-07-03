const formatPct = (v: number): string => `${v.toFixed(1)}%`;

const formatCount = (v: number): string => Math.round(v).toLocaleString();

// "YYYY-MM-DD" → "M/D" (차트 X축 레이블용)
const formatShortDate = (isoDate: string): string => {
	const [, m, d] = isoDate.split("-");
	return `${parseInt(m, 10)}/${parseInt(d, 10)}`;
};

export { formatCount, formatPct, formatShortDate };
