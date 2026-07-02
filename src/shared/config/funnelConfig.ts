// ✏️ 이 파일에서 퍼널을 정의하세요.
// 각 퍼널의 steps에 PostHog 이벤트명을 순서대로 입력하면
// Funnels 대시보드에서 해당 플로우의 전환율을 확인할 수 있습니다.
//
// 예시:
// {
//   id: 'signup',
//   name: '회원가입 플로우',
//   steps: [
//     { event: 'signup_started',   label: '가입 시작' },
//     { event: 'email_verified',   label: '이메일 인증' },
//     { event: 'signup_completed', label: '가입 완료' },
//   ],
// }

interface FunnelStepConfig {
	event: string; // PostHog 이벤트명
	label: string; // 대시보드에 표시될 단계 이름
}

interface FunnelConfig {
	id: string; // 고유 식별자 (영문 소문자·숫자·하이픈만 허용)
	name: string; // 대시보드 퍼널 선택 탭에 표시될 이름
	steps: readonly FunnelStepConfig[]; // 2단계 이상 권장
}

const FUNNEL_CONFIG: readonly FunnelConfig[] = [
	{
		id: "default",
		name: "기본 플로우",
		steps: [
			{ event: "$pageview", label: "페이지 방문" },
			{ event: "button_clicked", label: "버튼 클릭" },
			{ event: "form_submitted", label: "폼 제출" },
			{ event: "tab_changed", label: "탭 전환" },
		],
	},
	{
		id: "form-entry",
		name: "폼 진입 플로우",
		steps: [
			{ event: "$pageview", label: "페이지 방문" },
			{ event: "input_focus", label: "인풋 포커스" },
			{ event: "form_submitted", label: "폼 제출" },
		],
	},
	{
		id: "click-conversion",
		name: "클릭 전환 플로우",
		steps: [
			{ event: "$pageview", label: "페이지 방문" },
			{ event: "button_clicked", label: "버튼 클릭" },
			{ event: "form_submitted", label: "폼 제출" },
		],
	},
];

const getFunnelById = (id: string): FunnelConfig | undefined =>
	FUNNEL_CONFIG.find((f) => f.id === id);

export type { FunnelConfig, FunnelStepConfig };
export { FUNNEL_CONFIG, getFunnelById };
