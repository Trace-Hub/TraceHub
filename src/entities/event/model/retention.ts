const RETENTION_WEEKS = 12

interface RetentionRawRow {
	personId: string
	weekStart: string // "2026-06-01" (KST 기준 주의 월요일)
}

interface RetentionCohort {
	weekStart: string
	cohortSize: number
	// W0=100% 고정, W1~W11=잔존율(%), null=아직 경과하지 않은 주차
	retentions: (number | null)[]
	// tooltip 표시용 절대 사용자 수
	counts: (number | null)[]
}

interface RetentionKpi {
	avgWeek1Retention: number
	bestCohort: { weekStart: string; rate: number } | null
	totalTrackedUsers: number
	currentWeekNewUsers: number
	// 12주 내 2개 이상 주차에 활성화된 사용자 수 (Half-Pie 차트용)
	retainedUsersCount: number
}

interface RetentionResponse {
	cohorts: RetentionCohort[]
	kpi: RetentionKpi
}

// ISO 날짜에 주 단위 오프셋 적용 — Date는 UTC midnight으로 파싱되어 DST 영향 없음
const addWeeks = (isoDate: string, weeks: number): string => {
	const ms = new Date(isoDate).getTime() + weeks * 7 * 24 * 60 * 60 * 1000
	return new Date(ms).toISOString().slice(0, 10)
}

const buildRetentionResponse = (
	rows: readonly RetentionRawRow[],
	todayWeekStart: string,
): { cohorts: RetentionCohort[]; kpi: RetentionKpi } => {
	// personId → 활성 주차 집합
	const personWeeks = new Map<string, Set<string>>()
	for (const { personId, weekStart } of rows) {
		let weeks = personWeeks.get(personId)
		if (!weeks) {
			weeks = new Set<string>()
			personWeeks.set(personId, weeks)
		}
		weeks.add(weekStart)
	}

	// 2주 이상 활성 사용자 집계 — Half-Pie 차트의 재방문 비율 계산용
	let retainedUsersCount = 0
	for (const weeks of personWeeks.values()) {
		if (weeks.size > 1) retainedUsersCount++
	}

	// 코호트 진입 주차(첫 방문 주) → 멤버 집합
	const cohortMap = new Map<string, Set<string>>()
	for (const [personId, weeks] of personWeeks) {
		const firstWeek = [...weeks].sort()[0]
		let members = cohortMap.get(firstWeek)
		if (!members) {
			members = new Set<string>()
			cohortMap.set(firstWeek, members)
		}
		members.add(personId)
	}

	const todayWeekMs = new Date(todayWeekStart).getTime()
	const sortedCohortWeeks = [...cohortMap.keys()].sort()

	const cohorts: RetentionCohort[] = sortedCohortWeeks.map((weekStart) => {
		// cohortMap.get()은 sortedCohortWeeks 생성 시점에 검증되어 항상 존재
		const members = cohortMap.get(weekStart) as Set<string>
		const cohortSize = members.size
		const cohortWeekMs = new Date(weekStart).getTime()
		const weeksElapsed = Math.round(
			(todayWeekMs - cohortWeekMs) / (7 * 24 * 60 * 60 * 1000),
		)

		const retentions: (number | null)[] = []
		const counts: (number | null)[] = []

		for (let w = 0; w < RETENTION_WEEKS; w++) {
			if (w > weeksElapsed) {
				retentions.push(null)
				counts.push(null)
			} else if (w === 0) {
				retentions.push(100)
				counts.push(cohortSize)
			} else {
				const targetWeek = addWeeks(weekStart, w)
				let retained = 0
				for (const personId of members) {
					if (personWeeks.get(personId)?.has(targetWeek)) retained++
				}
				const rate =
					cohortSize > 0 ? Math.round((retained / cohortSize) * 1000) / 10 : 0
				retentions.push(rate)
				counts.push(retained)
			}
		}

		return { weekStart, cohortSize, retentions, counts }
	})

	// KPI 집계
	const totalTrackedUsers = personWeeks.size
	const currentCohort = cohorts.find((c) => c.weekStart === todayWeekStart)
	const currentWeekNewUsers = currentCohort?.cohortSize ?? 0

	// W1 데이터가 있는 코호트(이번 주 코호트 제외)만 평균·최고 계산
	const cohortsWithW1 = cohorts.filter((c) => c.retentions[1] !== null)
	const avgWeek1Retention =
		cohortsWithW1.length > 0
			? Math.round(
					(cohortsWithW1.reduce(
						(sum, c) => sum + (c.retentions[1] as number),
						0,
					) /
						cohortsWithW1.length) *
						10,
				) / 10
			: 0

	let bestCohort: RetentionKpi["bestCohort"] = null
	for (const c of cohortsWithW1) {
		const rate = c.retentions[1] as number
		if (!bestCohort || rate > bestCohort.rate) {
			bestCohort = { weekStart: c.weekStart, rate }
		}
	}

	const kpi: RetentionKpi = {
		avgWeek1Retention,
		bestCohort,
		totalTrackedUsers,
		currentWeekNewUsers,
		retainedUsersCount,
	}

	return { cohorts, kpi }
}

// "2026-04-20" → "4/20 ~ 4/26" (히트맵 코호트 레이블용)
const formatWeekRange = (isoDate: string): string => {
	const [, monthStr, dayStr] = isoDate.split("-")
	const startMs = new Date(isoDate).getTime()
	const end = new Date(startMs + 6 * 24 * 60 * 60 * 1000)
	return `${parseInt(monthStr, 10)}/${parseInt(dayStr, 10)} ~ ${end.getUTCMonth() + 1}/${end.getUTCDate()}`
}

// "2026-05-18" → "5/18" (콤보차트 X축 레이블용)
const formatShortDate = (isoDate: string): string => {
	const [, monthStr, dayStr] = isoDate.split("-")
	return `${parseInt(monthStr, 10)}/${parseInt(dayStr, 10)}`
}

// "2026-05-18" → "5월 4주" (한국식 주차: 해당 월 1일 기준 몇 번째 주)
const formatWeekOfMonth = (isoDate: string): string => {
	const [yearStr, monthStr, dayStr] = isoDate.split("-")
	const year = parseInt(yearStr, 10)
	const month = parseInt(monthStr, 10)
	const day = parseInt(dayStr, 10)
	// getDay()는 0=Sun이므로 Mon=0 기준으로 변환
	const rawDay = new Date(year, month - 1, 1).getDay()
	const dayOfWeek = rawDay === 0 ? 6 : rawDay - 1
	const weekNum = Math.ceil((day + dayOfWeek) / 7)
	return `${month}월 ${weekNum}주`
}

export type {
	RetentionCohort,
	RetentionKpi,
	RetentionRawRow,
	RetentionResponse,
}
export {
	RETENTION_WEEKS,
	addWeeks,
	buildRetentionResponse,
	formatShortDate,
	formatWeekOfMonth,
	formatWeekRange,
}
