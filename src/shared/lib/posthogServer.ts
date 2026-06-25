import type {
	Period,
	PostHogQueryResult,
} from "@/entities/event/model/eventStats";
import { TRACKED_PATHS } from "@/shared/config/trackedPaths";

// NEXT_POSTHOG_PERSONAL_API_KEY 는 NEXT_PUBLIC_ 접두사가 없어 클라이언트 번들에서 undefined.
// 따라서 본 모듈은 사실상 server-only 로 동작한다.

const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST;
const POSTHOG_API_KEY = process.env.NEXT_POSTHOG_PERSONAL_API_KEY;
const POSTHOG_PROJECT_ID = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_ID;

// HogQL 은 toTimezone() 함수를 미지원하므로 INTERVAL 산술로 KST(UTC+9) 오프셋 적용
const KST_OFFSET = "INTERVAL 9 HOUR";

// HogQL 문자열 리터럴 내 역슬래시·단일 따옴표를 이스케이프 — ClickHouse는 \를 이스케이프
// 문자로 해석하므로 \를 먼저 처리한 뒤 '를 이스케이프해야 이중 치환 오류를 막을 수 있음
const sanitizeHogQLString = (value: string): string =>
	value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");

const VALID_PERIODS: Period[] = ["day", "week", "month"];

const buildKstPeriodFilter = (period: Period): string => {
	switch (period) {
		case "day":
			return `toDate(timestamp + ${KST_OFFSET}) = toDate(now() + ${KST_OFFSET})`;
		case "week":
			return `toDate(timestamp + ${KST_OFFSET}) >= toDate(now() + ${KST_OFFSET}) - 6`;
		case "month":
			return `toDate(timestamp + ${KST_OFFSET}) >= toDate(now() + ${KST_OFFSET}) - 29`;
	}
};

const buildKstPreviousPeriodFilter = (period: Period): string => {
	switch (period) {
		case "day":
			return `toDate(timestamp + ${KST_OFFSET}) = toDate(now() + ${KST_OFFSET}) - 1`;
		case "week":
			return `toDate(timestamp + ${KST_OFFSET}) >= toDate(now() + ${KST_OFFSET}) - 13 AND toDate(timestamp + ${KST_OFFSET}) <= toDate(now() + ${KST_OFFSET}) - 7`;
		case "month":
			return `toDate(timestamp + ${KST_OFFSET}) >= toDate(now() + ${KST_OFFSET}) - 59 AND toDate(timestamp + ${KST_OFFSET}) <= toDate(now() + ${KST_OFFSET}) - 30`;
	}
};

// RE2(ClickHouse 정규식 엔진)에서 특수문자로 해석되는 문자를 이스케이프
// 경로에 . 등이 포함될 때 의도치 않은 매칭 방지
const escapeRegexPath = (path: string): string =>
	path.replace(/[.+*?()|[\]{}^$\\]/g, "\\$&");

// 글로브 패턴 배열 → ClickHouse match() 단일 정규식으로 변환
// OR 체인 대신 match() 한 줄을 쓰는 이유:
// 경로 수에 무관하게 행당 정규식 평가가 1회로 고정되어 성능이 일정하게 유지됨
// specificPath를 전달하면 해당 경로만, 없으면 TRACKED_PATHS 전체를 필터
const buildPathFilter = (specificPath?: string): string => {
	const paths: readonly string[] = specificPath ? [specificPath] : TRACKED_PATHS;
	const patterns = paths.map((p) => {
		if (p.endsWith("/*")) {
			const base = escapeRegexPath(p.slice(0, -2));
			// (/.*)?  →  /posthog 자체와 /posthog/1 같은 하위 경로 모두 포함
			return `${base}(/.*)?`;
		}
		return escapeRegexPath(p);
	});
	// ^(...)$로 감싸 부분 일치 방지 (/posthog-other 가 /posthog/* 에 걸리지 않도록)
	return `match(properties.$pathname, '^(${patterns.join("|")})$')`;
};

// path 파라미터 검증과 pathFilter 생성을 한 번에 처리
// 두 API route(events, events/kpi)에서 동일한 검증 로직이 반복되므로 단일 진실의 원천으로 관리
const resolvePathFilter = (rawPath: string): string | null => {
	if (rawPath !== "all" && !(TRACKED_PATHS as readonly string[]).includes(rawPath)) {
		return null;
	}
	return buildPathFilter(rawPath === "all" ? undefined : rawPath);
};

const runHogQLQuery = async (query: string): Promise<PostHogQueryResult> => {
	if (!POSTHOG_HOST || !POSTHOG_API_KEY || !POSTHOG_PROJECT_ID) {
		throw new Error("PostHog 환경변수가 설정되지 않았습니다");
	}
	const response = await fetch(
		`${POSTHOG_HOST}/api/projects/${POSTHOG_PROJECT_ID}/query`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${POSTHOG_API_KEY}`,
			},
			body: JSON.stringify({ query: { kind: "HogQLQuery", query } }),
			signal: AbortSignal.timeout(10_000),
		},
	);
	if (!response.ok) {
		const body = await response.text();
		throw new Error(`PostHog API ${response.status}: ${body}`);
	}
	return response.json();
};

export {
	buildKstPeriodFilter,
	buildKstPreviousPeriodFilter,
	buildPathFilter,
	KST_OFFSET,
	resolvePathFilter,
	runHogQLQuery,
	sanitizeHogQLString,
	VALID_PERIODS,
};
