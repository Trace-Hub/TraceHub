interface EventInsightTexts {
	increase: string;
	decrease: string;
}

const EVENT_INSIGHT: Record<string, EventInsightTexts> = {
	$pageview: {
		increase: "유입 경로를 분석하고 주요 페이지 전환율을 모니터링하세요.",
		decrease: "유입 경로를 점검하고 이탈 원인을 분석하세요.",
	},
	$pageleave: {
		increase: "이탈률 증가 원인을 파악하고 콘텐츠 품질을 점검하세요.",
		decrease:
			"사용자 체류 시간이 늘고 있습니다. 인게이지먼트 향상 전략을 유지하세요.",
	},
	$autocapture: {
		increase:
			"자동 캡처 이벤트 증가 추이를 확인하고 주요 인터랙션을 파악하세요.",
		decrease: "사용자 인터랙션 감소 원인을 분석하세요.",
	},
	$identify: {
		increase: "신규 사용자 식별이 증가하고 있습니다. 온보딩 경험을 점검하세요.",
		decrease: "신규 유입이 줄고 있습니다. 회원가입 전환율을 확인하세요.",
	},
	button_clicked: {
		increase: "클릭 패턴을 분석해 주요 CTA의 효과를 확인하세요.",
		decrease: "버튼 노출 위치와 문구를 점검하세요.",
	},
	link_clicked: {
		increase: "주요 링크의 클릭률을 확인하고 콘텐츠 연관성을 높이세요.",
		decrease: "링크 가시성과 연결 콘텐츠의 품질을 점검하세요.",
	},
	form_submitted: {
		increase: "전환율 상승 원인을 파악하고 성공 패턴을 유지하세요.",
		decrease: "폼 입력 단계별 이탈 지점을 확인하세요.",
	},
	tab_changed: {
		increase: "활성 탭의 콘텐츠 품질을 유지하고 확장을 검토하세요.",
		decrease: "탭 구성과 콘텐츠 배치를 재검토하세요.",
	},
	input_focus: {
		increase:
			"사용자 입력 참여도가 높아지고 있습니다. 폼 UX를 지속적으로 개선하세요.",
		decrease: "입력 필드의 접근성과 사용성을 점검하세요.",
	},
};

const DEFAULT_INSIGHT: EventInsightTexts = {
	increase: "발생 추이를 지속적으로 모니터링하세요.",
	decrease: "발생 감소 원인을 분석하고 대응 방안을 검토하세요.",
};

// 마지막 글자의 받침 여부로 주격 조사를 결정
function getSubjectParticle(text: string): string {
	const lastChar = text[text.length - 1];
	const code = lastChar?.charCodeAt(0) ?? 0;
	if (code < 0xac00 || code > 0xd7a3) return "이";
	return (code - 0xac00) % 28 > 0 ? "이" : "가";
}

function getFactText(eventLabel: string, currentTotal: number): string {
	const particle = getSubjectParticle(eventLabel);
	return `${eventLabel}${particle} ${currentTotal.toLocaleString()}회 발생했습니다.`;
}

function getComparisonText(changeRate: number): string {
	if (changeRate === 0) return "이전 기간과 동일한 수준입니다.";

	const direction = changeRate > 0 ? "증가" : "감소";
	const absRate = Math.abs(changeRate);
	let text = `이전 대비 ${absRate}% ${direction}했습니다.`;

	if (changeRate >= 30) {
		text +=
			" 급격한 증가세가 감지되었습니다. 트래픽 급증 원인을 파악해 기회를 활용하세요.";
	} else if (changeRate <= -30) {
		text += " 급격한 감소세가 감지되었습니다. 즉각적인 원인 분석이 필요합니다.";
	}

	return text;
}

function getActionText(event: string, changeRate: number): string {
	const texts = EVENT_INSIGHT[event] ?? DEFAULT_INSIGHT;
	return changeRate >= 0 ? texts.increase : texts.decrease;
}

export { getActionText, getComparisonText, getFactText };
