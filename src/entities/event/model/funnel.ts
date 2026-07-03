import type { FunnelStepConfig } from "@/shared/config/funnelConfig";
import { formatPct } from "@/shared/lib/formatters";

export { formatPct };

const buildKstDateRange = (days: number): string[] => {
	const kstNow = Date.now() + 9 * 60 * 60 * 1000;
	const result: string[] = [];
	for (let d = days - 1; d >= 0; d--) {
		const ms = kstNow - d * 24 * 60 * 60 * 1000;
		const date = new Date(ms);
		const y = date.getUTCFullYear();
		const m = String(date.getUTCMonth() + 1).padStart(2, "0");
		const day = String(date.getUTCDate()).padStart(2, "0");
		result.push(`${y}-${m}-${day}`);
	}
	return result;
};

type FunnelPeriod = "7d" | "30d";

type FunnelTab = "7일" | "30일";

interface FunnelRawRow {
	personId: string;
	event: string;
	date: string; // "YYYY-MM-DD" KST
}

interface FunnelStepResult {
	event: string;
	label: string;
	color: string;
	count: number;
	conversionRate: number; // vs step 1, 0-100
	dropoffRate: number; // vs prev step, 0-100; step 1은 0
}

interface FunnelTrendPoint {
	date: string;
	conversionRate: number; // 0-100
}

interface FunnelKpi {
	overallConversionRate: number;
	maxDropoffStepLabel: string;
	maxDropoffRate: number;
}

interface FunnelResponse {
	steps: FunnelStepResult[];
	trend: FunnelTrendPoint[];
	kpi: FunnelKpi;
}

const FUNNEL_TAB_TO_PERIOD: Record<FunnelTab, FunnelPeriod> = {
	"7일": "7d",
	"30일": "30d",
} as const;

const VALID_FUNNEL_PERIODS: FunnelPeriod[] = ["7d", "30d"];

const FUNNEL_LOOKBACK_DAYS: Record<FunnelPeriod, number> = {
	"7d": 7,
	"30d": 30,
};

// 단계 순서대로 색상 할당 — 6단계 초과 시 순환
const FUNNEL_STEP_COLORS = [
	"var(--color-primary)",
	"var(--color-success)",
	"var(--color-surge)",
	"var(--color-warning)",
	"var(--color-error)",
	"var(--color-primary-hover)",
] as const;

// personId별 이벤트를 날짜 순 정렬 후 steps 순서대로 통과 여부 집계
const countFunnelStepsPure = (
	rows: readonly FunnelRawRow[],
	steps: readonly FunnelStepConfig[],
): number[] => {
	const personEvents = new Map<string, { event: string; date: string }[]>();

	for (const row of rows) {
		let events = personEvents.get(row.personId);
		if (!events) {
			events = [];
			personEvents.set(row.personId, events);
		}
		events.push({ event: row.event, date: row.date });
	}

	for (const events of personEvents.values()) {
		events.sort((a, b) => a.date.localeCompare(b.date));
	}

	const counts = new Array<number>(steps.length).fill(0);

	for (const events of personEvents.values()) {
		let stepIdx = 0;
		for (const { event } of events) {
			if (stepIdx >= steps.length) break;
			if (event === steps[stepIdx].event) {
				counts[stepIdx]++;
				stepIdx++;
			}
		}
	}

	return counts;
};

const buildFunnelStepResults = (
	counts: number[],
	steps: readonly FunnelStepConfig[],
): FunnelStepResult[] => {
	const step1Count = counts[0] ?? 0;

	return steps.map((stepDef, i) => {
		const count = counts[i] ?? 0;
		const conversionRate =
			step1Count > 0 ? Math.round((count / step1Count) * 1000) / 10 : 0;
		const prevCount = i === 0 ? count : (counts[i - 1] ?? 0);
		const dropoffRate =
			i === 0 || prevCount === 0
				? 0
				: Math.round(((prevCount - count) / prevCount) * 1000) / 10;

		return {
			event: stepDef.event,
			label: stepDef.label,
			color: FUNNEL_STEP_COLORS[i % FUNNEL_STEP_COLORS.length],
			count,
			conversionRate,
			dropoffRate,
		};
	});
};

// 당일 step 1 코호트 기준 날짜별 전환율 계산.
// 동일 날짜 이벤트만 보면 멀티-데이 여정을 놓쳐 30일 뷰에서 값이 비정상으로 낮아지는 문제를 방지.
const buildFunnelTrend = (
	rows: FunnelRawRow[],
	dateRange: string[],
	steps: readonly FunnelStepConfig[],
): FunnelTrendPoint[] => {
	const firstStepEvent = steps[0]?.event ?? "";

	return dateRange.map((dateStr) => {
		const startedIds = new Set(
			rows
				.filter((r) => r.date === dateStr && r.event === firstStepEvent)
				.map((r) => r.personId),
		);
		if (startedIds.size === 0) return { date: dateStr, conversionRate: 0 };

		const cohortRows = rows.filter(
			(r) => startedIds.has(r.personId) && r.date >= dateStr,
		);
		const cohortCounts = countFunnelStepsPure(cohortRows, steps);
		const cohortFirst = cohortCounts[0] ?? 0;
		const cohortLast = cohortCounts[steps.length - 1] ?? 0;
		const conversionRate =
			cohortFirst > 0
				? Math.round((cohortLast / cohortFirst) * 1000) / 10
				: 0;
		return { date: dateStr, conversionRate };
	});
};

const buildFunnelResponse = (
	rows: FunnelRawRow[],
	dateRange: string[],
	steps: readonly FunnelStepConfig[],
): FunnelResponse => {
	const overallCounts = countFunnelStepsPure(rows, steps);
	const funnelSteps = buildFunnelStepResults(overallCounts, steps);

	const overallConversionRate = funnelSteps[funnelSteps.length - 1]?.conversionRate ?? 0;

	let maxDropoffStepLabel = funnelSteps[1]?.label ?? "";
	let maxDropoffRate = funnelSteps[1]?.dropoffRate ?? 0;
	for (let i = 2; i < funnelSteps.length; i++) {
		const rate = funnelSteps[i]?.dropoffRate ?? 0;
		if (rate > maxDropoffRate) {
			maxDropoffRate = rate;
			maxDropoffStepLabel = funnelSteps[i]?.label ?? "";
		}
	}

	return {
		steps: funnelSteps,
		trend: buildFunnelTrend(rows, dateRange, steps),
		kpi: { overallConversionRate, maxDropoffStepLabel, maxDropoffRate },
	};
};

export type {
	FunnelKpi,
	FunnelPeriod,
	FunnelRawRow,
	FunnelResponse,
	FunnelStepResult,
	FunnelTab,
	FunnelTrendPoint,
};
export {
	buildFunnelResponse,
	buildFunnelStepResults,
	buildKstDateRange,
	countFunnelStepsPure,
	FUNNEL_LOOKBACK_DAYS,
	FUNNEL_TAB_TO_PERIOD,
	VALID_FUNNEL_PERIODS,
};
