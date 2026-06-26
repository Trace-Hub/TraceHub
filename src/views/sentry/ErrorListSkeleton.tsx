import type { ReactElement } from "react";
import Skeleton from "@/shared/ui/skeleton";

/** 에러 목록 카드 스켈레톤 (인사이트 열린 상태 기준) */
const ErrorListSkeleton = (): ReactElement => {
  return (
    <div className="flex flex-col gap-3">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="rounded-xl border border-border-subtle bg-bg-card overflow-hidden"
        >
          {/* 카드 본문 */}
          <div className="flex flex-col gap-3 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-10" />
                <Skeleton className="h-4 w-52" />
              </div>
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-3 w-72" />
            <Skeleton className="h-3 w-36" />
          </div>

          {/* 인사이트 영역 */}
          <div className="px-4 pb-3 flex flex-col gap-2">
            <div className="flex items-start gap-2 px-2 py-3 border-l-4 border-l-primary bg-bg-subtle rounded-xs">
              <Skeleton className="h-4 w-10 shrink-0" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="flex items-start gap-2 px-2 py-3 border-l-4 border-l-success bg-bg-subtle rounded-xs">
              <Skeleton className="h-4 w-10 shrink-0" />
              <Skeleton className="h-4 w-5/6" />
            </div>
            <div className="flex items-start gap-2 px-2 py-3 border-l-4 border-l-surge bg-bg-subtle rounded-xs">
              <Skeleton className="h-4 w-10 shrink-0" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>

          {/* 푸터 */}
          <div className="flex items-center justify-between px-4 py-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ErrorListSkeleton;
