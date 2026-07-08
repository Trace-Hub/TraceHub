"use client";

import type { ReactElement } from "react";
import {
  captureError,
  captureMessage,
  setSentryUser,
} from "@/shared/lib/sentry";
import PathsFlowTestNav from "@/views/posthog/dev/PathsFlowTestNav";

const SentryTestPage = (): ReactElement => {
  return (
    <div className="p-10 flex flex-col gap-6 bg-bg-base min-h-screen">
      <h1 className="text-h1 font-bold text-text-primary">
        Sentry 에러 전송 테스트
      </h1>

      <PathsFlowTestNav />

      <div className="flex flex-col gap-3 max-w-sm">
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
          에러 전송 (captureError)
        </button>

        <button
          type="button"
          onClick={() => {
            captureMessage("테스트 메시지 전송", "warning");
            alert("✅ 메시지 전송 완료!");
          }}
          className="px-4 py-2 rounded-md bg-warning text-white text-body2 font-medium active:scale-95 transition-transform"
        >
          메시지 전송 (captureMessage)
        </button>

        <button
          type="button"
          onClick={() => {
            setSentryUser({ id: "test-user-123", email: "test@tracehub.com" });
            captureError(new Error("유저 정보 포함 에러"));
            alert("✅ 유저 에러 전송 완료!");
          }}
          className="px-4 py-2 rounded-md bg-success text-white text-body2 font-medium active:scale-95 transition-transform"
        >
          유저 정보 포함 에러 전송
        </button>

        <hr className="border-border-subtle my-2" />

        <p className="text-body2 font-medium text-text-primary">
          HTTP 상태 코드별 에러 테스트
        </p>

        <button
          type="button"
          onClick={async () => {
            const res = await fetch("/api/sentry/test/error?status=400");
            if (!res.ok) {
              captureError(new Error(`HTTP ${res.status}: Bad Request`), {
                "http.status_code": res.status,
              });
            }
            alert(`✅ 400 에러 전송 완료! (status: ${res.status})`);
          }}
          className="px-4 py-2 rounded-md bg-warning text-white text-body2 font-medium active:scale-95 transition-transform"
        >
          400 Bad Request 에러 전송
        </button>

        <button
          type="button"
          onClick={async () => {
            const res = await fetch("/api/sentry/test/error?status=403");
            if (!res.ok) {
              captureError(new Error(`HTTP ${res.status}: Forbidden`), {
                "http.status_code": res.status,
              });
            }
            alert(`✅ 403 에러 전송 완료! (status: ${res.status})`);
          }}
          className="px-4 py-2 rounded-md bg-surge text-white text-body2 font-medium active:scale-95 transition-transform"
        >
          403 Forbidden 에러 전송
        </button>

        <button
          type="button"
          onClick={async () => {
            const res = await fetch("/api/sentry/test/error?status=404");
            if (!res.ok) {
              captureError(new Error(`HTTP ${res.status}: Not Found`), {
                "http.status_code": res.status,
              });
            }
            alert(`✅ 404 에러 전송 완료! (status: ${res.status})`);
          }}
          className="px-4 py-2 rounded-md bg-text-secondary text-white text-body2 font-medium active:scale-95 transition-transform"
        >
          404 Not Found 에러 전송
        </button>

        <button
          type="button"
          onClick={async () => {
            const res = await fetch("/api/sentry/test/error?status=500");
            if (!res.ok) {
              captureError(
                new Error(`HTTP ${res.status}: Internal Server Error`),
                {
                  "http.status_code": res.status,
                },
              );
            }
            alert(`✅ 500 에러 전송 완료! (status: ${res.status})`);
          }}
          className="px-4 py-2 rounded-md bg-error text-white text-body2 font-medium active:scale-95 transition-transform"
        >
          500 Internal Server Error 전송
        </button>
      </div>

      <p className="text-caption text-text-tertiary">
        버튼 클릭 후 Sentry 대시보드 Issues 탭에서 수신 확인
      </p>
    </div>
  );
};

export default SentryTestPage;
