"use client";

import type { ReactElement } from "react";
import {
  captureError,
  captureMessage,
  setSentryUser,
} from "@/shared/lib/sentry";

const SentryTestPage = (): ReactElement => {
  return (
    <div className="p-10 flex flex-col gap-6 bg-bg-base min-h-screen">
      <h1 className="text-h1 font-bold text-text-primary">
        Sentry 에러 전송 테스트
      </h1>

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
      </div>

      <p className="text-caption text-text-tertiary">
        버튼 클릭 후 Sentry 대시보드 Issues 탭에서 수신 확인
      </p>
    </div>
  );
};

export default SentryTestPage;
