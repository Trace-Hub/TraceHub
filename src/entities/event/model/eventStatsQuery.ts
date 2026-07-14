import type { EventCategory } from "@/entities/event/model/eventCategory";
import {
	INTERACTION_EVENTS,
	NAVIGATION_EVENTS,
} from "@/entities/event/model/eventCategory";
import type { Period } from "@/entities/event/model/eventStats";
import { EVENT_LABEL } from "@/shared/config/eventLabel";
import {
	buildKstPeriodFilter,
	buildKstPreviousPeriodFilter,
	KST_OFFSET,
	sanitizeHogQLLikePattern,
	sanitizeHogQLString,
} from "@/shared/lib/posthogServer";

// 커서에 사용하는 Buffer(Node 전용 API)가 클라이언트 번들에 섞여 들어가지 않도록,
// HogQL 쿼리 빌더는 fetchEventStatsServer.ts(서버 전용)에서만 import한다

interface HogQLQueries {
	current: string;
	previous: string;
}

// 이벤트 목록 무한스크롤 커서 — currentTotal 내림차순 정렬에서 동점(count 동일) 시
// event명을 보조 키로 사용해야 keyset이 안정적으로 다음 페이지를 가리킴
interface EventCursor {
	total: number;
	event: string;
}

const encodeCursor = (cursor: EventCursor): string =>
	Buffer.from(JSON.stringify(cursor)).toString("base64");

const decodeCursor = (raw: string): EventCursor | null => {
	try {
		const parsed = JSON.parse(Buffer.from(raw, "base64").toString("utf-8"));
		if (
			typeof parsed === "object" &&
			parsed !== null &&
			typeof (parsed as EventCursor).total === "number" &&
			Number.isFinite((parsed as EventCursor).total) &&
			typeof (parsed as EventCursor).event === "string"
		) {
			return parsed as EventCursor;
		}
		return null;
	} catch {
		return null;
	}
};

// 정적으로 알려진 이벤트명 집합(카테고리 등)을 HogQL IN 절로 변환
const buildInCondition = (column: string, values: readonly string[]): string =>
	`${column} IN (${values.map((v) => `'${sanitizeHogQLString(v)}'`).join(", ")})`;

// 카테고리 필터 → HogQL 조건. "all"은 필터 없음을 의미하므로 null 반환
const buildCategoryCondition = (category: EventCategory): string | null => {
	if (category === "all") return null;
	if (category === "navigation") {
		return buildInCondition("event", [...NAVIGATION_EVENTS]);
	}
	if (category === "interaction") {
		return buildInCondition("event", [...INTERACTION_EVENTS]);
	}
	// system: "$" 접두사이면서 내비게이션에 속하지 않는 이벤트 (autocapture, identify 등)
	const navigationCondition = buildInCondition("event", [...NAVIGATION_EVENTS]);
	return `(event LIKE '$%' AND NOT ${navigationCondition})`;
};

// 검색어 필터 — 원본 이벤트명 부분일치 + 한글 라벨(eventLabel.ts) 부분일치 이벤트명을 함께 매칭
// LIKE 절의 검색어는 %, _ 가 와일드카드로 해석되지 않도록 sanitizeHogQLLikePattern으로 이스케이프
const buildSearchCondition = (query: string): string => {
	const lowerQuery = query.toLowerCase();
	const likeSafeQuery = sanitizeHogQLLikePattern(lowerQuery);
	const labelMatchedEvents = Object.entries(EVENT_LABEL)
		.filter(([, label]) => label.toLowerCase().includes(lowerQuery))
		.map(([event]) => event);

	const conditions = [`lower(event) LIKE '%${likeSafeQuery}%'`];
	if (labelMatchedEvents.length > 0) {
		conditions.push(buildInCondition("event", labelMatchedEvents));
	}
	return `(${conditions.join(" OR ")})`;
};

// 1단계: 이번 페이지에 노출할 이벤트명 + currentTotal 선정
// currentTotal 내림차순, 동점 시 event ASC로 정렬해 keyset pagination에 사용
const buildSelectionQuery = (
	period: Period,
	pathFilter: string,
	category: EventCategory,
	search: string,
	cursor: EventCursor | null,
	limit: number,
): string => {
	const currentFilter = buildKstPeriodFilter(period);
	const categoryCondition = buildCategoryCondition(category);
	const searchCondition = search ? buildSearchCondition(search) : null;

	const extraConditions = [categoryCondition, searchCondition]
		.filter((c): c is string => c !== null)
		.map((c) => `AND ${c}`)
		.join("\n      ");

	const havingClause = cursor
		? `HAVING (total < ${cursor.total} OR (total = ${cursor.total} AND event > '${sanitizeHogQLString(cursor.event)}'))`
		: "";

	return `
      SELECT event, count() AS total
      FROM events
      WHERE ${currentFilter}
      AND ${pathFilter}
      ${extraConditions}
      GROUP BY event
      ${havingClause}
      ORDER BY total DESC, event ASC
      LIMIT ${limit}
    `;
};

// 2단계: 1단계에서 선정된 이벤트명들의 breakdown·이전 기간 합계만 조회
const buildQueries = (
	period: Period,
	pathFilter: string,
	eventNames: readonly string[],
): HogQLQueries => {
	const currentFilter = buildKstPeriodFilter(period);
	const previousFilter = buildKstPreviousPeriodFilter(period);
	const eventInCondition = buildInCondition("event", eventNames);
	// day는 시간(toHour), week/month는 날짜(toDate)로 집계 단위가 다름
	const unitExpr =
		period === "day"
			? `toHour(timestamp + ${KST_OFFSET})`
			: `toDate(timestamp + ${KST_OFFSET})`;

	return {
		current: `
      SELECT event, ${unitExpr} AS unit, count() AS count
      FROM events
      WHERE ${currentFilter}
      AND ${pathFilter}
      AND ${eventInCondition}
      GROUP BY event, unit
      ORDER BY event, unit ASC
    `,
		previous: `
      SELECT event, count() AS count
      FROM events
      WHERE ${previousFilter}
      AND ${pathFilter}
      AND ${eventInCondition}
      GROUP BY event
    `,
	};
};

export type { EventCursor };
export { buildQueries, buildSelectionQuery, decodeCursor, encodeCursor };
