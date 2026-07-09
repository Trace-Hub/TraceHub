import type { Period } from "@/entities/event/model/eventStats"
import { parsePathBucket } from "@/shared/lib/parsePathBucket"

// 세션별 방문 원본 행 — KPI(세션 첫/마지막 방문 집계)와 Sankey 흐름(연속 방문 쌍, Average time
// 계산) 양쪽에서 공통으로 쓴다. timestamp는 ISO 원본(KST 오프셋 미적용)이며 날짜로 절삭하지
// 않는다 — 정렬뿐 아니라 Average time 계산에 실제 시각 정밀도가 필요하기 때문이다.
interface PathVisitRow {
	sessionId: string
	path: string
	timestamp: string
}

interface TopPathStat {
	path: string
	count: number
}

interface PathsKpiResponse {
	topEntryPath: TopPathStat | null
	topExitPath: TopPathStat | null
}

// Step은 "방문한 페이지 수"가 아니라 "페이지 간 이동 횟수"다 — steps=N을 선택하면
// 시작 페이지(Step 0)부터 N번 이동한 결과까지, 즉 최대 N+1개의 페이지 노드를 본다
type PathStepCount = 1 | 2 | 3 | 4 | 5
const VALID_PATH_STEP_COUNTS: PathStepCount[] = [1, 2, 3, 4, 5]

// 두 서버 쿼리(KPI/Flow)가 동일한 기간 필터를 쓰도록 단일 맵으로 관리 —
// 캘린더 기준 "오늘"이 아닌 rolling window (지난 N일)로 계산한다. toDate() 기반 필터는
// 이 쿼리들이 select하는 nullable 컬럼(properties.$session_id/$pathname)과 함께 쓰이면
// HogQL이 toDate를 toDateOrNull로 치환하며 타입 오류를 내는 문제가 있어 피한다.
const PATH_PERIOD_TO_DAYS: Record<Period, number> = {
	day: 1,
	week: 7,
	month: 30,
}

// 실제 페이지 노드 — step은 0(시작점)부터 stepCount까지의 순번. 모든 필드는 "이 노드(정확히
// 이 step의 이 경로)에 도달한 세션"만을 기준으로 한다 — 같은 경로가 다른 step에도 나타나면
// 완전히 별개의 숫자를 가진다(페이지 전체 기간 통계가 아님).
interface PathRealNodeStat {
	kind: "real"
	step: number
	path: string
	occurrences: number // 이 step에 정확히 이 경로로 도달한 세션 수
	continuingCount: number // 그중 이 다이어그램에서 다음 step으로 이어진 세션 수
	continuingRate: number // 0-100, 다음 step으로 이어지는 비율
	droppingOffCount: number // 그중 이 다이어그램에서 더 이상 이어지지 않은 세션 수
	droppingOffRate: number // 0-100, 더 이상 이어지지 않는 비율
	avgTimeFromPreviousStepMs: number | null // 이전 단계 방문 → 이 단계 방문 평균 소요 시간(ms). Step 0은 이전 단계가 없어 null
}

// 컬럼(step)별 상위 노출 개수를 넘는 나머지를 하나로 합친 합성 노드.
// 여러 실제 페이지를 묶은 것이라 Continuing/Dropping off은 의미가 없어 필드 자체를 두지 않는다.
interface PathOtherNodeStat {
	kind: "other"
	step: number
	path: string // 내부 식별자, 예: "__other::3" — 실제 표시 라벨은 위젯에서 매핑
	occurrences: number // 이 합성 노드로 묶인 페이지들의 해당 step 방문자 수 합
}

type PathNodeStat = PathRealNodeStat | PathOtherNodeStat

interface PathEdgeStat {
	step: number // source 쪽 step — target은 항상 step+1 (인접 컬럼끼리만 연결)
	source: string
	target: string
	count: number // source → target 이동 발생 횟수 (동일 사용자의 반복 이동 포함)
	ratio: number // 같은 step 구간 전체 이동 대비 비율(0-100) — Sankey 두께 안내용
	avgTimeMs: number // source 방문 → target 방문 평균 소요 시간(ms)
}

interface PathFlowsResponse {
	startPath: string | null // null = "전체 경로"(시작점 필터 없음) — 세션별 실제 첫 방문 페이지가 Step 0이 된다
	nodes: PathNodeStat[] // Step 0(시작점)부터 stepCount까지 노출된 노드만 포함
	edges: PathEdgeStat[]
}

// 컬럼(step)당 노출할 상위 경로 수 — 나머지는 "기타" 하나로 병합해 복잡도를 제한한다
const PATH_TOP_BRANCHES_PER_STEP = 4
// 합성 "기타" 노드의 내부 식별자 접두사 — 실제 pathname은 항상 "/"로 시작해 충돌하지 않는다
const OTHER_NODE_PREFIX = "__other::"
const otherNodeId = (step: number): string => `${OTHER_NODE_PREFIX}${step}`

// sessionId 필드를 가진 행들을 세션별로 묶는다 — buildPathsKpi/collectRawEdges 양쪽이
// 각자 구현하던 동일한 Map 그룹핑 루프(get-or-create 배열 후 push)를 공유한다
const groupBySessionId = <T extends { sessionId: string }>(
	rows: readonly T[],
): Map<string, T[]> => {
	const grouped = new Map<string, T[]>()
	for (const row of rows) {
		let visits = grouped.get(row.sessionId)
		if (!visits) {
			visits = []
			grouped.set(row.sessionId, visits)
		}
		visits.push(row)
	}
	return grouped
}

// 세션별 방문을 시간순 정렬해 첫/마지막 경로를 집계 → 상위 시작·이탈 경로 KPI
const buildPathsKpi = (rows: readonly PathVisitRow[]): PathsKpiResponse => {
	const sessionVisits = groupBySessionId(rows)

	const entryCounts = new Map<string, number>()
	const exitCounts = new Map<string, number>()

	for (const visits of sessionVisits.values()) {
		const sorted = [...visits].sort((a, b) => a.timestamp.localeCompare(b.timestamp))
		const entryPath = sorted[0].path
		const exitPath = sorted[sorted.length - 1].path
		entryCounts.set(entryPath, (entryCounts.get(entryPath) ?? 0) + 1)
		exitCounts.set(exitPath, (exitCounts.get(exitPath) ?? 0) + 1)
	}

	const topOf = (counts: Map<string, number>): TopPathStat | null => {
		let top: TopPathStat | null = null
		for (const [path, count] of counts) {
			if (!top || count > top.count) top = { path, count }
		}
		return top
	}

	return { topEntryPath: topOf(entryCounts), topExitPath: topOf(exitCounts) }
}

// TRACKED_PATHS 항목은 "/posthog/*"처럼 하위 경로를 포함하는 글롭일 수 있다 —
// parsePathBucket으로 shared/lib/posthogServer.ts의 buildPathFilter(HogQL match 정규식)와
// 동일한 규칙을 공유해, 실제 pathname이 특정 버킷 패턴에 속하는지 판별한다
const matchesBucket = (path: string, bucket: string): boolean => {
	const { base, isPrefix } = parsePathBucket(bucket)
	if (!isPrefix) return path === base
	return path === base || path.startsWith(`${base}/`)
}

interface EdgeAccumulator {
	step: number
	source: string
	target: string
	count: number
	timeSumMs: number
}

interface CollectResult {
	edges: Map<string, EdgeAccumulator> // key: `${step}::${source}::${target}`
	stepNodeCounts: Map<string, number> // key: `${step}::${path}` — 가지치기 전 컬럼별 방문자 수
	// key: `${step}::${path}` — 그 세션의 윈도우가 여기서 끝났지만(edge를 만들지 못했지만)
	// 실제로는 이 지점 이후에도 방문이 더 있었던 세션 수. windowEnd가 stepCount 상한이나
	// 앵커 재등장으로 절단된 세션은 edges에 다음 step 데이터가 없어 continuedCountBySource만으로는
	// 항상 "이탈"로 집계되므로, 이 값을 더해 실제 지속 여부를 반영한다.
	continuedBeyondWindowCounts: Map<string, number>
}

// 세션별 방문 기록을 시간순 정렬한 뒤, 세션마다 정확히 하나의 여정만 만든다 —
// 시작점 필터가 없으면 그 세션의 실제 첫 방문이 Step 0, 필터가 있으면 그 필터에
// 처음 매칭되는 지점이 Step 0이다. 세션 중간에 같은 페이지가 다시 나와도 별도
// 여정으로 쪼개지 않는다(사용자가 실제로 겪는 "하나의 여정"이라는 개념과 어긋나기 때문).
const collectRawEdges = (
	rows: readonly PathVisitRow[],
	startPath: string | null,
	stepCount: PathStepCount,
): CollectResult => {
	const sessionVisits = groupBySessionId(rows)

	const edges = new Map<string, EdgeAccumulator>()
	const stepNodeCounts = new Map<string, number>()
	const continuedBeyondWindowCounts = new Map<string, number>()

	for (const visits of sessionVisits.values()) {
		const sorted = [...visits].sort((a, b) => a.timestamp.localeCompare(b.timestamp))

		// 연속으로 같은 페이지가 찍힌 경우(새로고침 등)는 실제 이동이 아니므로 하나로 합친다 —
		// 그렇지 않으면 시작점 자신이 새로고침됐다는 이유만으로 "이탈 후 재방문"으로 오인되어,
		// 시작점과 똑같은 노드가 나중 step에 또 나타나 버린다(합치지 않으면 재등장 판별이
		// 무력화되어 대부분의 여정이 한 걸음도 못 나가고 끊기는 문제로 이어졌다).
		const deduped: PathVisitRow[] = []
		for (const visit of sorted) {
			if (deduped.length > 0 && deduped[deduped.length - 1].path === visit.path) continue
			deduped.push(visit)
		}
		const paths = deduped.map((v) => v.path)

		const anchorIdx = startPath === null ? 0 : paths.findIndex((p) => matchesBucket(p, startPath))
		if (anchorIdx === -1) continue // 필터링한 시작점을 방문한 적 없음 (이론상 서버 쿼리에서 이미 걸러짐)

		let windowEnd = Math.min(paths.length - 1, anchorIdx + stepCount)
		// 같은 여정 안에서 앵커와 리터럴로 똑같은 경로가 다시 나타나면 그 지점 이전까지만 본다 —
		// 그렇지 않으면 앵커 페이지(예: "/")가 나중에 다시 방문됐다는 이유만으로 시작점과 똑같은
		// 노드가 엉뚱한 step에 또 나타나 버린다. 반드시 앵커의 "리터럴 경로"와 비교해야 한다 —
		// 시작점 필터가 "/posthog/*"처럼 글롭이면, 버킷 일치 여부로 비교할 경우 /posthog(앵커) →
		// /posthog/1(같은 버킷의 다음 실제 이동)까지도 "재등장"으로 오인해 매 세션이 한 걸음도
		// 못 나가고 끊겨버린다.
		for (let k = anchorIdx + 1; k <= windowEnd; k++) {
			if (paths[k] === paths[anchorIdx]) {
				windowEnd = k - 1
				break
			}
		}

		for (let j = anchorIdx; j <= windowEnd; j++) {
			const key = `${j - anchorIdx}::${paths[j]}`
			stepNodeCounts.set(key, (stepNodeCounts.get(key) ?? 0) + 1)
		}

		for (let j = anchorIdx; j < windowEnd; j++) {
			const sourcePath = paths[j]
			const targetPath = paths[j + 1]

			const step = j - anchorIdx
			const key = `${step}::${sourcePath}::${targetPath}`
			const deltaMs =
				new Date(deduped[j + 1].timestamp).getTime() - new Date(deduped[j].timestamp).getTime()
			const acc = edges.get(key)
			if (acc) {
				acc.count += 1
				acc.timeSumMs += deltaMs
			} else {
				edges.set(key, { step, source: sourcePath, target: targetPath, count: 1, timeSumMs: deltaMs })
			}
		}

		// 이 세션의 윈도우 마지막 노드(edge가 없어 "이탈"로만 집계될 지점)가 실제로는
		// 더 이어졌는지 확인 — stepCount 상한 또는 앵커 재등장 절단 때문에 다음 방문이
		// 있어도 edges에는 반영되지 않는다
		if (windowEnd < paths.length - 1) {
			const terminalStep = windowEnd - anchorIdx
			const key = `${terminalStep}::${paths[windowEnd]}`
			continuedBeyondWindowCounts.set(key, (continuedBeyondWindowCounts.get(key) ?? 0) + 1)
		}
	}

	return { edges, stepNodeCounts, continuedBeyondWindowCounts }
}

interface PruneResult {
	edges: EdgeAccumulator[]
	keptPathsByStep: Map<number, string[]> // 방문자 수 내림차순 — 컬럼별로 실제 노출할 경로
	otherCounts: Map<number, number> // 컬럼별 "기타"로 묶인 방문자 수 합 (overflow가 없으면 항목 자체가 없음)
}

// 컬럼(step)마다 방문자 수(stepNodeCounts) 기준 상위 PATH_TOP_BRANCHES_PER_STEP개 노드만
// 남기고 나머지는 "기타" 하나로 병합한다. Step 0도 예외 없이 동일하게 취급한다 — 시작점
// 필터가 없으면("전체 경로") 세션마다 실제 첫 방문 페이지가 달라 이 컬럼도 여러 개로
// 나뉠 수 있기 때문이다. 랭킹 기준은 엣지 개수가 아니라 "그 컬럼에 실제로 도달한 방문자 수"
// 여야 한다 — 엣지 개수로 줄 세우면 같은 노드로 들어오는 엣지가 여럿일 때 그 노드의 실제
// 인기도가 여러 엣지로 쪼개져 랭킹에서 밀려날 수 있다.
const pruneByStep = (
	stepNodeCounts: Map<string, number>,
	rawEdges: Map<string, EdgeAccumulator>,
	stepCount: PathStepCount,
): PruneResult => {
	const countsByStep = new Map<number, { path: string; count: number }[]>()
	for (const [key, count] of stepNodeCounts) {
		const separatorIdx = key.indexOf("::")
		const step = Number(key.slice(0, separatorIdx))
		const path = key.slice(separatorIdx + 2)
		let list = countsByStep.get(step)
		if (!list) {
			list = []
			countsByStep.set(step, list)
		}
		list.push({ path, count })
	}

	const keptPathsByStep = new Map<number, string[]>()
	const keptSetByStep = new Map<number, Set<string>>()
	const otherCounts = new Map<number, number>()

	for (let step = 0; step <= stepCount; step++) {
		const list = countsByStep.get(step) ?? []
		const sorted = [...list].sort((a, b) =>
			b.count !== a.count ? b.count - a.count : a.path.localeCompare(b.path),
		)
		const kept = sorted.slice(0, PATH_TOP_BRANCHES_PER_STEP)
		const overflow = sorted.slice(PATH_TOP_BRANCHES_PER_STEP)

		keptPathsByStep.set(step, kept.map((k) => k.path))
		keptSetByStep.set(step, new Set(kept.map((k) => k.path)))
		if (overflow.length > 0) {
			otherCounts.set(step, overflow.reduce((sum, o) => sum + o.count, 0))
		}
	}

	const remapped = new Map<string, EdgeAccumulator>()
	for (const edge of rawEdges.values()) {
		const sourceKept = keptSetByStep.get(edge.step)?.has(edge.source) ?? false
		const targetKept = keptSetByStep.get(edge.step + 1)?.has(edge.target) ?? false
		const mappedSource = sourceKept ? edge.source : otherNodeId(edge.step)
		const mappedTarget = targetKept ? edge.target : otherNodeId(edge.step + 1)
		const key = `${edge.step}::${mappedSource}::${mappedTarget}`
		const acc = remapped.get(key)
		if (acc) {
			acc.count += edge.count
			acc.timeSumMs += edge.timeSumMs
		} else {
			remapped.set(key, {
				step: edge.step,
				source: mappedSource,
				target: mappedTarget,
				count: edge.count,
				timeSumMs: edge.timeSumMs,
			})
		}
	}

	return { edges: [...remapped.values()], keptPathsByStep, otherCounts }
}

const buildPathFlows = (
	rows: readonly PathVisitRow[],
	startPath: string | null,
	stepCount: PathStepCount,
): PathFlowsResponse => {
	const { edges: rawEdges, stepNodeCounts, continuedBeyondWindowCounts } = collectRawEdges(rows, startPath, stepCount)
	const { edges: prunedEdges, keptPathsByStep, otherCounts } = pruneByStep(stepNodeCounts, rawEdges, stepCount)

	// ratio는 같은 step 구간(같은 컬럼 간 이동) 전체 대비 비율 — 컬럼 단위로 "이 구간에서 차지하는 비중"을 보여준다
	const totalByStep = new Map<number, number>()
	for (const e of prunedEdges) {
		totalByStep.set(e.step, (totalByStep.get(e.step) ?? 0) + e.count)
	}

	const edgeStats: PathEdgeStat[] = prunedEdges.map((e) => {
		const total = totalByStep.get(e.step) ?? 0
		return {
			step: e.step,
			source: e.source,
			target: e.target,
			count: e.count,
			ratio: total > 0 ? Math.round((e.count / total) * 1000) / 10 : 0,
			avgTimeMs: Math.round(e.timeSumMs / e.count),
		}
	})

	// 노드별 "이전 단계에서 이 단계로" 평균 소요 시간 — 한 노드로 들어오는 edge가 여러 개일 수
	// 있어 이미 반올림된 edgeStats.avgTimeMs 대신 원본 timeSumMs/count로 가중평균을 계산한다
	const timeSumByTargetNode = new Map<string, number>()
	const countByTargetNode = new Map<string, number>()
	for (const e of prunedEdges) {
		const key = `${e.step + 1}::${e.target}`
		timeSumByTargetNode.set(key, (timeSumByTargetNode.get(key) ?? 0) + e.timeSumMs)
		countByTargetNode.set(key, (countByTargetNode.get(key) ?? 0) + e.count)
	}

	// 노드에서 다음 step으로 실제로 이어진 세션 수 — Continuing/Dropping off을 이 노드(정확히
	// 이 step의 이 경로) 기준으로 계산하려면 이 노드가 SOURCE인 pruned edge들의 count 합이 필요하다.
	// 이전에는 이 값을 "그 페이지의 전체 기간 방문 횟수"로 계산해서, 같은 경로가 다른 step에 있을 때도
	// 항상 같은 숫자를 보여주고, 실제로 이 노드에 도달한 세션 수와 다른 값이 나오는 문제가 있었다.
	const continuedCountBySource = new Map<string, number>()
	for (const e of prunedEdges) {
		const key = `${e.step}::${e.source}`
		continuedCountBySource.set(key, (continuedCountBySource.get(key) ?? 0) + e.count)
	}
	for (const [key, count] of continuedBeyondWindowCounts) {
		continuedCountBySource.set(key, (continuedCountBySource.get(key) ?? 0) + count)
	}

	const nodeStats: PathNodeStat[] = []
	for (let step = 0; step <= stepCount; step++) {
		for (const path of keptPathsByStep.get(step) ?? []) {
			const total = stepNodeCounts.get(`${step}::${path}`) ?? 0
			const continuedCount = continuedCountBySource.get(`${step}::${path}`) ?? 0
			const droppedCount = total - continuedCount
			const timeKey = `${step}::${path}`
			const timeSum = timeSumByTargetNode.get(timeKey)
			const timeCount = countByTargetNode.get(timeKey)
			nodeStats.push({
				kind: "real",
				step,
				path,
				occurrences: total,
				continuingCount: continuedCount,
				continuingRate: total > 0 ? Math.round((continuedCount / total) * 1000) / 10 : 0,
				droppingOffCount: droppedCount,
				droppingOffRate: total > 0 ? Math.round((droppedCount / total) * 1000) / 10 : 0,
				avgTimeFromPreviousStepMs: timeSum !== undefined && timeCount ? Math.round(timeSum / timeCount) : null,
			})
		}
		const otherCount = otherCounts.get(step)
		if (otherCount !== undefined) {
			nodeStats.push({ kind: "other", step, path: otherNodeId(step), occurrences: otherCount })
		}
	}

	return { startPath, nodes: nodeStats, edges: edgeStats }
}

export type {
	PathEdgeStat,
	PathFlowsResponse,
	PathNodeStat,
	PathOtherNodeStat,
	PathRealNodeStat,
	PathsKpiResponse,
	PathStepCount,
	PathVisitRow,
	TopPathStat,
}
export {
	buildPathFlows,
	buildPathsKpi,
	PATH_PERIOD_TO_DAYS,
	PATH_TOP_BRANCHES_PER_STEP,
	VALID_PATH_STEP_COUNTS,
}
