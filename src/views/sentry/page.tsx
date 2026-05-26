"use client";

import { useState } from "react";
import type { ReactElement } from "react";
import {
  captureError,
  captureMessage,
  setSentryUser,
} from "@/shared/lib/sentry";
import { useErrorList } from "@/entities/error/api/getErrorList";
import type {
  ErrorStatus,
  SentryIssue,
} from "@/entities/error/model/errorStats";
import ErrorIssueCard from "@/views/sentry/ErrorIssueCard";

const SentryPage = (): ReactElement => {
  const [status, setStatus] = useState<ErrorStatus>("unresolved");
  const [selectedIssue, setSelectedIssue] = useState<SentryIssue | null>(null);
  const { data, isLoading, error } = useErrorList({ status });

  const handleIssueClick = (issue: SentryIssue): void => {
    setSelectedIssue(selectedIssue?.id === issue.id ? null : issue);
  };

  return (
    <div className="p-10 flex flex-col gap-8 bg-bg-base min-h-screen">
      <h1 className="text-h1 font-bold text-text-primary">Sentry 테스트</h1>

      {/* 에러 전송 테스트 */}
      <section className="flex flex-col gap-3">
        <h2 className="text-body1 font-medium text-text-primary">
          에러 전송 테스트
        </h2>
        <div className="flex gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => {
              captureError(new Error("테스트 에러 전송"), {
                page: "sentry-test",
              });
              alert("✅ 에러 전송 완료!");
            }}
            className="px-4 py-2 rounded-md bg-primary text-white text-body2 font-medium active:scale-95 transition-transform"
          >
            에러 전송
          </button>
          <button
            type="button"
            onClick={() => {
              captureMessage("테스트 메시지", "warning");
              alert("✅ 메시지 전송 완료!");
            }}
            className="px-4 py-2 rounded-md bg-warning text-white text-body2 font-medium active:scale-95 transition-transform"
          >
            메시지 전송
          </button>
          <button
            type="button"
            onClick={() => {
              setSentryUser({
                id: "test-user-123",
                email: "test@tracehub.com",
              });
              captureError(new Error("유저 정보 포함 에러"));
              alert("✅ 유저 에러 전송 완료!");
            }}
            className="px-4 py-2 rounded-md bg-success text-white text-body2 font-medium active:scale-95 transition-transform"
          >
            유저 에러 전송
          </button>
        </div>
      </section>

      {/* API 조회 테스트 */}
      <section className="flex flex-col gap-3">
        <h2 className="text-body1 font-medium text-text-primary">
          Sentry API 조회
        </h2>
        <div className="flex gap-2">
          {(["unresolved", "ignored", "resolved"] as ErrorStatus[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setStatus(s);
                setSelectedIssue(null);
              }}
              className={`px-3 py-1.5 rounded-md text-body2 font-medium transition-colors ${
                status === s
                  ? "bg-primary text-white"
                  : "bg-bg-subtle text-text-secondary border border-border-base"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {isLoading && (
          <p className="text-body2 text-text-tertiary">로딩 중...</p>
        )}
        {error && <p className="text-body2 text-error">{error.message}</p>}

        {data && (
          <div className="flex flex-col gap-2">
            <p className="text-caption text-text-tertiary">
              총 {data.issues.length}개 이슈
            </p>
            {data.issues.map((issue) => (
              <ErrorIssueCard
                key={issue.id}
                issue={issue}
                isSelected={selectedIssue?.id === issue.id}
                onClick={() => handleIssueClick(issue)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default SentryPage;
