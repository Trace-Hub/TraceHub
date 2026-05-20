"use client";

import {trackEvent} from "@/shared/lib/posthog";
import {useState} from "react";

const PosthogPage = () => {
    const [activeTab, setActiveTab] = useState("A");
    const [lastEvent, setLastEvent] = useState("");

    const handleTabChange = (tab: string): void => {
        setActiveTab(tab);
        trackEvent("TAB_CHANGED", {tab});
        setLastEvent(`tab_changed / 탭: ${tab}`);
    };

    return (
        <div className="min-h-screen bg-white p-10 font-sans items-center w-full flex flex-col gap-10">
            <div className="flex flex-col gap-4 text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    PostHog Event Test Page
                </h1>
                <p className="text-sm text-gray-500 mb-10">
                    각 항목을 조작하고 PostHog Live Events에서 이벤트를 확인하세요.
                </p>
            </div>

            <div className="flex flex-col gap-10">
                {/* 버튼 클릭 */}
                <section>
                    <h2 className="text-base font-semibold text-gray-700 mb-3">
                        버튼 클릭 테스트
                    </h2>
                    <button
                        type="button"
                        onClick={() => {
                            trackEvent("BUTTON_CLICKED", {label: "테스트 버튼"});
                            setLastEvent("button_clicked");
                        }}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                        클릭하세요
                    </button>
                </section>

                {/* 링크 클릭 */}
                <section>
                    <h2 className="text-base font-semibold text-gray-700 mb-3">
                        링크 클릭 테스트
                    </h2>
                    <a
                        href="https://posthog.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                            trackEvent("LINK_CLICKED", {url: "https://posthog.com"});
                            setLastEvent("link_clicked");
                        }}
                        className="text-sm text-blue-600 underline"
                    >
                        PostHog 공식 사이트로 이동
                    </a>
                </section>

                {/* 폼 제출 */}
                <section>
                    <h2 className="text-base font-semibold text-gray-700 mb-3">
                        폼 제출 테스트
                    </h2>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const inputEl = e.currentTarget.elements.namedItem("testInput");
                            const input = inputEl instanceof HTMLInputElement ? inputEl.value : "";
                            trackEvent("FORM_SUBMITTED", {input_length: input.length, has_value: input.length > 0});
                            setLastEvent("form_submitted");
                        }}
                        className="flex gap-2"
                    >
                        <input
                            name="testInput"
                            type="text"
                            placeholder="텍스트를 입력하세요"
                            className="px-3 py-2 text-sm border border-gray-300 rounded w-60"
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 bg-gray-800 text-white text-sm rounded hover:bg-gray-900"
                        >
                            제출
                        </button>
                    </form>
                </section>

                {/* 탭 전환 */}
                <section>
                    <h2 className="text-base font-semibold text-gray-700 mb-3">
                        탭 전환 테스트
                    </h2>
                    <div className="flex gap-2 mb-3">
                        {["A", "B", "C"].map((tab) => (
                            <button
                                key={tab}
                                type="button"
                                onClick={() => handleTabChange(tab)}
                                className={`px-4 py-2 text-sm rounded border ${
                                    activeTab === tab
                                        ? "bg-blue-600 text-white border-blue-600"
                                        : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                                }`}
                            >
                                탭 {tab}
                            </button>
                        ))}
                    </div>
                </section>

                {/* 입력 포커스 */}
                <section>
                    <h2 className="text-base font-semibold text-gray-700 mb-3">
                        입력 포커스 테스트
                    </h2>
                    <input
                        type="text"
                        placeholder="클릭하면 이벤트가 발생합니다"
                        onFocus={() => {
                            trackEvent("INPUT_FOCUSED", {field: "test_input"});
                            setLastEvent("input_focused");
                        }}
                        className="px-3 py-2 text-sm border border-gray-300 rounded w-72"
                    />
                </section>
            </div>

            {lastEvent && (
                <p className="text-sm text-gray-500">마지막 이벤트: {lastEvent}</p>
            )}
        </div>
    );
};

export default PosthogPage;
