import { addWeeks, buildRetentionResponse } from "./retention"

describe("addWeeks", () => {
	it("정확한 주 오프셋을 반환한다", () => {
		expect(addWeeks("2026-06-01", 1)).toBe("2026-06-08")
		expect(addWeeks("2026-06-01", 0)).toBe("2026-06-01")
		expect(addWeeks("2026-06-01", 11)).toBe("2026-08-17")
	})
})

describe("buildRetentionResponse", () => {
	const todayWeekStart = "2026-06-29" // Monday

	it("빈 rows에서 빈 cohorts와 0 KPI를 반환한다", () => {
		const { cohorts, kpi } = buildRetentionResponse([], todayWeekStart)
		expect(cohorts).toHaveLength(0)
		expect(kpi.avgWeek1Retention).toBe(0)
		expect(kpi.bestCohort).toBeNull()
		expect(kpi.totalTrackedUsers).toBe(0)
		expect(kpi.currentWeekNewUsers).toBe(0)
		expect(kpi.retainedUsersCount).toBe(0)
	})

	it("단일 주차 방문자는 재방문 없는 cohort를 생성한다", () => {
		const rows = [
			{ personId: "p1", weekStart: "2026-06-22" },
			{ personId: "p2", weekStart: "2026-06-22" },
		]
		const { cohorts, kpi } = buildRetentionResponse(rows, todayWeekStart)

		expect(cohorts).toHaveLength(1)
		expect(cohorts[0].cohortSize).toBe(2)
		expect(cohorts[0].retentions[0]).toBe(100) // W0
		expect(cohorts[0].retentions[1]).toBe(0) // W1 = 0%
		expect(cohorts[0].counts[0]).toBe(2)
		expect(cohorts[0].counts[1]).toBe(0)
		expect(kpi.retainedUsersCount).toBe(0)
	})

	it("W1 재방문 사용자의 잔존율을 정확히 계산한다", () => {
		const rows = [
			{ personId: "p1", weekStart: "2026-06-22" },
			{ personId: "p1", weekStart: "2026-06-29" }, // p1이 W1에 재방문
			{ personId: "p2", weekStart: "2026-06-22" },
		]
		const { cohorts, kpi } = buildRetentionResponse(rows, todayWeekStart)

		expect(cohorts[0].retentions[1]).toBe(50) // 2명 중 1명 재방문 = 50%
		expect(cohorts[0].counts[1]).toBe(1)
		expect(kpi.retainedUsersCount).toBe(1) // p1만 2주 이상 활성
		expect(kpi.avgWeek1Retention).toBe(50)
		expect(kpi.bestCohort?.weekStart).toBe("2026-06-22")
		expect(kpi.bestCohort?.rate).toBe(50)
	})

	it("미래 주차는 null로 처리한다", () => {
		const rows = [{ personId: "p1", weekStart: todayWeekStart }]
		const { cohorts } = buildRetentionResponse(rows, todayWeekStart)

		// 이번 주 코호트는 W0만 데이터, W1~W11은 null
		expect(cohorts[0].retentions[0]).toBe(100)
		expect(cohorts[0].retentions[1]).toBeNull()
		expect(cohorts[0].counts[1]).toBeNull()
	})

	it("여러 cohort 주차를 날짜 오름차순으로 분리한다", () => {
		const rows = [
			{ personId: "p1", weekStart: "2026-06-15" },
			{ personId: "p2", weekStart: "2026-06-22" },
		]
		const { cohorts } = buildRetentionResponse(rows, todayWeekStart)

		expect(cohorts).toHaveLength(2)
		expect(cohorts[0].weekStart).toBe("2026-06-15")
		expect(cohorts[1].weekStart).toBe("2026-06-22")
	})

	it("이번 주 신규 코호트 크기를 반환한다", () => {
		const rows = [
			{ personId: "p1", weekStart: todayWeekStart },
			{ personId: "p2", weekStart: todayWeekStart },
		]
		const { kpi } = buildRetentionResponse(rows, todayWeekStart)
		expect(kpi.currentWeekNewUsers).toBe(2)
	})

	it("이전 주 방문 후 이번 주에도 방문한 사용자는 이전 코호트로 분류된다", () => {
		const rows = [
			{ personId: "p1", weekStart: "2026-06-22" },
			{ personId: "p1", weekStart: todayWeekStart },
		]
		const { cohorts, kpi } = buildRetentionResponse(rows, todayWeekStart)

		// p1의 첫 방문이 "2026-06-22"이므로 이번 주 신규 코호트 크기는 0
		expect(kpi.currentWeekNewUsers).toBe(0)
		expect(cohorts[0].weekStart).toBe("2026-06-22")
		expect(kpi.retainedUsersCount).toBe(1)
	})

	it("중복 rows는 동일 주차로 합산된다", () => {
		const rows = [
			{ personId: "p1", weekStart: "2026-06-22" },
			{ personId: "p1", weekStart: "2026-06-22" }, // 중복
		]
		const { cohorts } = buildRetentionResponse(rows, todayWeekStart)
		expect(cohorts[0].cohortSize).toBe(1) // Set이므로 중복 제거
	})
})
