import type { ReactElement } from "react";
import Skeleton from "@/shared/ui/skeleton";
import { cn } from "@/shared/lib/utils";

interface ErrorDetailSkeletonProps {
  className?: string;
}

/** 에러 상세 페이지 스켈레톤 — 실제 레이아웃과 동일한 규격 */
const ErrorDetailSkeleton = ({
  className,
}: ErrorDetailSkeletonProps): ReactElement => {
  return (
    <div className={cn("flex flex-col gap-4 p-6", className)}>
      {/* 뒤로가기 */}
      <Skeleton className="h-4 w-40" />

      {/* 이슈 헤더 카드 */}
      <div className="p-4 rounded-xl border border-border-base bg-bg-base flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-3 w-48" />
        <Skeleton className="h-3 w-80" />
      </div>

      {/* 인사이트 섹션 */}
      <section className="flex flex-col gap-2 p-4 rounded-xl border border-border-base bg-bg-base">
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
      </section>

      {/* 시간대별 발생 현황 */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-36" />
        </div>
        <div className="p-4 rounded-xl border border-border-base bg-bg-base">
          <Skeleton className="h-52 w-full" />
        </div>
      </section>

      {/* 환경별 분포 */}
      <section className="flex flex-col gap-3">
        <Skeleton className="h-4 w-20" />
        <div className="p-4 rounded-xl border border-border-base bg-bg-base flex flex-col gap-4">
          <div className="flex gap-1">
            <Skeleton className="h-7 w-16 rounded-md" />
            <Skeleton className="h-7 w-10 rounded-md" />
            <Skeleton className="h-7 w-10 rounded-md" />
          </div>
          <div className="flex flex-col gap-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-4/5" />
            <Skeleton className="h-8 w-3/5" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default ErrorDetailSkeleton;
