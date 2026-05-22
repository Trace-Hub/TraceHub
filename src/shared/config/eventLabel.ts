const EVENT_LABEL: Record<string, string> = {
    // PostHog 빌트인 이벤트
    "$pageview": "페이지 방문",
    "$pageleave": "페이지 이탈",
    "$autocapture": "자동 캡처",
    "$identify": "사용자 식별",
    // 커스텀 이벤트
    "button_clicked": "버튼 클릭",
    "link_clicked": "링크 클릭",
    "form_submitted": "폼 제출",
    "tab_changed": "탭 전환",
    "input_focus": "입력 포커스",
}

function getEventLabel(event: string): string {
    return EVENT_LABEL[event] ?? event
}

export { EVENT_LABEL, getEventLabel }
