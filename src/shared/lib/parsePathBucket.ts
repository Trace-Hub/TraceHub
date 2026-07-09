interface PathBucket {
	base: string;
	isPrefix: boolean; // true면 base 자체와 그 하위 경로(base/...)까지 포함하는 "/*" 글롭 버킷
}

// TRACKED_PATHS 항목("/foo" 또는 "/foo/*")을 base와 하위 경로 포함 여부로 분해한다 —
// SQL 정규식(posthogServer.ts의 buildPathFilter)과 JS 문자열 비교(paths.ts의 matchesBucket)
// 양쪽이 같은 글롭 규칙을 따로 구현해 드리프트나던 문제를 막기 위해 규칙 자체를 이 함수로 단일화한다
// bucket이 "/*" 그 자체면 base가 빈 문자열이 되어 buildPathFilter의 (/.*)? 패턴이
// 사실상 모든 경로를 매치하게 된다 — length > 2로 그 경우를 걸러 리터럴 취급한다
const parsePathBucket = (bucket: string): PathBucket =>
	bucket.endsWith("/*") && bucket.length > 2
		? { base: bucket.slice(0, -2), isPrefix: true }
		: { base: bucket, isPrefix: false };

export type { PathBucket };
export { parsePathBucket };
