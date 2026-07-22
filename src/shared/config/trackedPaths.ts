// 이벤트 대시보드에서 집계할 경로 목록
// - 경로 그대로: 해당 경로만 정확히 일치 (예: "/checkout")
// - /* 로 끝나면: 해당 경로와 모든 하위 경로 포함 (예: "/products/*" → /products, /products/1 ...)
// 추가로 분석하고 싶은 경로가 있으면 이 배열에 추가
export const TRACKED_PATHS = ["/"] as const;
