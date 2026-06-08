// 시리즈/슬라이스가 여러 개인 차트에서 항목별로 순환 사용하는 색상 팔레트.
// 사용 패턴: `CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length]`
const CHART_COLOR_PALETTE = [
	"var(--color-primary)",
	"var(--color-success)",
	"var(--color-warning)",
	"var(--color-error)",
	"var(--color-surge)",
] as const

export { CHART_COLOR_PALETTE }