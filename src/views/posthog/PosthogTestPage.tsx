"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import { FUNNEL_CONFIG } from "@/shared/config/funnelConfig";
import { trackEvent } from "@/shared/lib/posthog";
import PathsFlowTestNav from "@/views/posthog/PathsFlowTestNav";

type EventFeedback = Record<string, boolean>;
type TrackingKey = Parameters<typeof trackEvent>[0];

// PostHog 이벤트명 → trackEvent 키 매핑
const EVENT_TO_TRACKING_KEY: Partial<Record<string, TrackingKey>> = {
	button_clicked: "BUTTON_CLICKED",
	link_clicked: "LINK_CLICKED",
	form_submitted: "FORM_SUBMITTED",
	tab_changed: "TAB_CHANGED",
	input_focus: "INPUT_FOCUSED",
};

const DEMO_TABS = ["탭 1", "탭 2", "탭 3"] as const;

const fireFeedback = (
	key: string,
	set: React.Dispatch<React.SetStateAction<EventFeedback>>,
	fn: () => void,
): void => {
	fn();
	set((prev) => ({ ...prev, [key]: true }));
	setTimeout(() => set((prev) => ({ ...prev, [key]: false })), 2000);
};

const PosthogTestPage = (): ReactElement => {
	const [feedback, setFeedback] = useState<EventFeedback>({});
	const [activeTab, setActiveTab] = useState<string>("탭 1");
	const [activeFunnelId, setActiveFunnelId] = useState<string>(
		FUNNEL_CONFIG[0]?.id ?? "default",
	);
	const [funnelProgress, setFunnelProgress] = useState(0);
	const [formData, setFormData] = useState({ name: "", email: "" });

	const sent = (key: string): boolean => feedback[key] === true;

	const activeFunnel = FUNNEL_CONFIG.find((f) => f.id === activeFunnelId);
	// 첫 스텝이 $pageview면 자동 기록으로 처리하고 나머지만 수동 실행
	const hasAutoPageview = activeFunnel?.steps[0]?.event === "$pageview";
	const manualSteps = activeFunnel
		? activeFunnel.steps.slice(hasAutoPageview ? 1 : 0)
		: [];

	const handleFunnelChange = (id: string): void => {
		setActiveFunnelId(id);
		setFunnelProgress(0);
	};

	return (
		<div className="p-8 flex flex-col gap-8 bg-bg-base min-h-screen max-w-2xl mx-auto">
			<div>
				<h1 className="text-h1 font-bold text-text-primary">
					PostHog 이벤트 테스트
				</h1>
				<p className="text-body2 text-text-secondary mt-1">
					버튼을 눌러 PostHog 이벤트를 발생시키고 퍼널 대시보드에서 전환율을
					확인하세요.
				</p>
			</div>

			<PathsFlowTestNav />

			{/* 기본 이벤트 */}
			<section className="flex flex-col gap-3 p-5 rounded-xl border border-border-subtle bg-bg-card">
				<h2 className="text-body1 font-medium text-text-primary">
					기본 이벤트
				</h2>

				{/* 버튼 클릭 */}
				<div className="flex items-center justify-between p-3 rounded-lg border border-border-subtle">
					<div className="flex flex-col gap-0.5">
						<span className="text-body2 font-medium text-text-primary">
							버튼 클릭
						</span>
						<span className="text-caption font-mono text-text-tertiary">
							button_clicked
						</span>
					</div>
					<button
						type="button"
						onClick={() =>
							fireFeedback("button", setFeedback, () =>
								trackEvent("BUTTON_CLICKED", {
									label: "테스트 버튼",
									source: "posthog-test",
								}),
							)
						}
						className={`px-3 py-1.5 rounded-md text-body2 font-medium transition-[background-color,color] duration-150 ${
							sent("button")
								? "bg-success text-white"
								: "bg-primary text-white hover:bg-primary-hover"
						}`}
					>
						{sent("button") ? "전송됨" : "이벤트 발생"}
					</button>
				</div>

				{/* 링크 클릭 */}
				<div className="flex items-center justify-between p-3 rounded-lg border border-border-subtle">
					<div className="flex flex-col gap-0.5">
						<span className="text-body2 font-medium text-text-primary">
							링크 클릭
						</span>
						<span className="text-caption font-mono text-text-tertiary">
							link_clicked
						</span>
					</div>
					<button
						type="button"
						onClick={() =>
							fireFeedback("link", setFeedback, () =>
								trackEvent("LINK_CLICKED", {
									href: "/posthog",
									source: "posthog-test",
								}),
							)
						}
						className={`px-3 py-1.5 rounded-md text-body2 font-medium transition-[background-color,color] duration-150 ${
							sent("link")
								? "bg-success text-white"
								: "bg-primary text-white hover:bg-primary-hover"
						}`}
					>
						{sent("link") ? "전송됨" : "이벤트 발생"}
					</button>
				</div>

				{/* 탭 전환 */}
				<div className="flex flex-col gap-2 p-3 rounded-lg border border-border-subtle">
					<div className="flex flex-col gap-0.5">
						<span className="text-body2 font-medium text-text-primary">
							탭 전환
						</span>
						<span className="text-caption font-mono text-text-tertiary">
							tab_changed
						</span>
					</div>
					<div className="flex gap-2">
						{DEMO_TABS.map((tab) => (
							<button
								key={tab}
								type="button"
								onClick={() => {
									setActiveTab(tab);
									trackEvent("TAB_CHANGED", {
										tab,
										source: "posthog-test",
									});
								}}
								className={`px-3 py-1.5 rounded-md text-body2 font-medium transition-[background-color,color] duration-150 ${
									activeTab === tab
										? "bg-primary text-white"
										: "bg-bg-overlay text-text-secondary hover:text-text-primary"
								}`}
							>
								{tab}
							</button>
						))}
					</div>
					<p className="text-caption text-text-tertiary">
						현재 활성 탭: {activeTab} — 탭을 전환할 때마다 이벤트가 발생합니다.
					</p>
				</div>
			</section>

			{/* 폼 이벤트 */}
			<section className="flex flex-col gap-3 p-5 rounded-xl border border-border-subtle bg-bg-card">
				<h2 className="text-body1 font-medium text-text-primary">폼 이벤트</h2>
				<p className="text-caption text-text-secondary">
					인풋 포커스 시 <span className="font-mono">input_focus</span> 이벤트,
					제출 시 <span className="font-mono">form_submitted</span> 이벤트가
					발생합니다.
				</p>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						fireFeedback("form", setFeedback, () =>
							trackEvent("FORM_SUBMITTED", {
								name: formData.name,
								email: formData.email,
								source: "posthog-test",
							}),
						);
					}}
					className="flex flex-col gap-3"
				>
					<div className="flex flex-col gap-1">
						<label
							htmlFor="test-name"
							className="text-caption text-text-secondary"
						>
							이름
						</label>
						<input
							id="test-name"
							type="text"
							placeholder="홍길동"
							value={formData.name}
							onFocus={() =>
								trackEvent("INPUT_FOCUSED", {
									field: "name",
									source: "posthog-test",
								})
							}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, name: e.target.value }))
							}
							className="px-3 py-2 rounded-md border border-border-base bg-bg-base text-body2 text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-border-focus transition-colors"
						/>
					</div>
					<div className="flex flex-col gap-1">
						<label
							htmlFor="test-email"
							className="text-caption text-text-secondary"
						>
							이메일
						</label>
						<input
							id="test-email"
							type="email"
							placeholder="test@example.com"
							value={formData.email}
							onFocus={() =>
								trackEvent("INPUT_FOCUSED", {
									field: "email",
									source: "posthog-test",
								})
							}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, email: e.target.value }))
							}
							className="px-3 py-2 rounded-md border border-border-base bg-bg-base text-body2 text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-border-focus transition-colors"
						/>
					</div>
					<button
						type="submit"
						className={`py-2 rounded-md text-body2 font-medium transition-[background-color] duration-150 ${
							sent("form")
								? "bg-success text-white"
								: "bg-primary text-white hover:bg-primary-hover"
						}`}
					>
						{sent("form") ? "form_submitted 전송됨" : "폼 제출"}
					</button>
				</form>
			</section>

			{/* 퍼널 플로우 시뮬레이터 */}
			<section className="flex flex-col gap-3 p-5 rounded-xl border border-border-subtle bg-bg-card">
				<div className="flex items-start justify-between gap-4">
					<div>
						<h2 className="text-body1 font-medium text-text-primary">
							퍼널 플로우 시뮬레이터
						</h2>
						<p className="text-caption text-text-secondary mt-0.5">
							선택한 퍼널의 이벤트를 순서대로 발생시켜 전환율 데이터를
							생성합니다.
						</p>
					</div>
					{funnelProgress > 0 && (
						<button
							type="button"
							onClick={() => setFunnelProgress(0)}
							className="shrink-0 text-caption text-text-tertiary underline hover:text-text-secondary transition-colors"
						>
							초기화
						</button>
					)}
				</div>

				{/* 퍼널 선택 탭 */}
				{FUNNEL_CONFIG.length > 1 && (
					<div
						role="tablist"
						aria-label="퍼널 선택"
						className="flex items-center gap-2 flex-wrap"
					>
						{FUNNEL_CONFIG.map((funnel) => (
							<button
								key={funnel.id}
								type="button"
								role="tab"
								aria-selected={activeFunnelId === funnel.id}
								onClick={() => handleFunnelChange(funnel.id)}
								className={`px-3 py-1.5 rounded-full text-body2 border transition-[background-color,color,border-color] duration-150 ${
									activeFunnelId === funnel.id
										? "bg-bg-overlay border-border-base text-text-primary font-medium"
										: "bg-transparent border-border-subtle text-text-secondary hover:text-text-primary"
								}`}
							>
								{funnel.name}
							</button>
						))}
					</div>
				)}

				<div className="flex flex-col gap-2">
					{/* $pageview 자동 기록 행 */}
					{hasAutoPageview && (
						<div className="flex items-center gap-3 p-3 rounded-lg border border-success-subtle bg-success-subtle">
							<div className="w-6 h-6 rounded-full bg-success flex items-center justify-center shrink-0">
								<span className="text-white text-label font-bold">✓</span>
							</div>
							<div className="flex-1 flex flex-col gap-0.5">
								<span className="text-body2 font-medium text-text-primary">
									페이지 방문
								</span>
								<span className="text-caption font-mono text-text-tertiary">
									$pageview
								</span>
							</div>
							<span className="text-caption text-success font-medium shrink-0">
								자동 기록됨
							</span>
						</div>
					)}

					{/* 수동 실행 스텝 */}
					{manualSteps.map((step, i) => {
						const idx = i + 1;
						const done = funnelProgress >= idx;
						const isNext = funnelProgress === idx - 1;
						const trackingKey = EVENT_TO_TRACKING_KEY[step.event];

						return (
							<div
								key={step.event}
								className={`flex items-center gap-3 p-3 rounded-lg border transition-[border-color,background-color,opacity] duration-200 ${
									done
										? "border-success-subtle bg-success-subtle"
										: isNext
											? "border-border-base bg-bg-card"
											: "border-border-subtle bg-bg-card opacity-40"
								}`}
							>
								<div
									className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-label font-bold ${
										done
											? "bg-success text-white"
											: isNext
												? "bg-bg-overlay border border-border-base text-text-secondary"
												: "bg-bg-subtle border border-border-subtle text-text-disabled"
									}`}
								>
									{done ? "✓" : idx}
								</div>
								<div className="flex-1 flex flex-col gap-0.5">
									<span className="text-body2 font-medium text-text-primary">
										{step.label}
									</span>
									<span className="text-caption font-mono text-text-tertiary">
										{step.event}
									</span>
								</div>
								{done ? (
									<span className="text-caption text-success font-medium shrink-0">
										완료
									</span>
								) : (
									<button
										type="button"
										disabled={!isNext || !trackingKey}
										onClick={() => {
											if (trackingKey) {
												trackEvent(trackingKey, {
													funnel: activeFunnelId,
													source: "posthog-test",
												});
											}
											setFunnelProgress(idx);
										}}
										className={`px-3 py-1.5 rounded-md text-body2 font-medium transition-[background-color,opacity] duration-150 shrink-0 ${
											isNext && trackingKey
												? "bg-primary text-white hover:bg-primary-hover"
												: "bg-bg-subtle text-text-disabled cursor-not-allowed"
										}`}
									>
										실행
									</button>
								)}
							</div>
						);
					})}

					{funnelProgress >= manualSteps.length && manualSteps.length > 0 && (
						<div className="p-4 rounded-lg border border-success-subtle bg-success-subtle text-center">
							<p className="text-body2 font-medium text-success">
								퍼널 플로우 완료!
							</p>
							<p className="text-caption text-text-secondary mt-1">
								퍼널 대시보드에서 전환율을 확인하세요. 일 단위 집계이므로 당일
								자정 이후 반영됩니다.
							</p>
						</div>
					)}
				</div>
			</section>

			<p className="text-caption text-text-tertiary pb-8">
				이벤트 발생 후 PostHog 대시보드 Activity → Explore에서 실시간 확인
				가능합니다.
			</p>
		</div>
	);
};

export default PosthogTestPage;
