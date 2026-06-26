import type { ReactElement } from "react";
import Skeleton from "@/shared/ui/skeleton";

/** 메인 대시보드 Top3 카드 + 차트 영역 스켈레톤 */
const MainDashboardSkeleton = (): ReactElement => {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 에러 Top 3 스켈레톤 */}
        <div className="flex flex-col gap-3">
          <Skeleton className="h-5 w-24" />
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex flex-col gap-3 p-4 rounded-xl border border-border-subtle bg-bg-card min-h-30"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-10" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-3 w-64" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>

        {/* 이벤트 Top 3 스켈레톤 */}
        <div className="flex flex-col gap-3">
          <Skeleton className="h-5 w-24" />
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex flex-col gap-3 p-4 rounded-xl border border-border-subtle bg-bg-card min-h-30"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-14" />
              </div>
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-56" />
            </div>
          ))}
        </div>
      </div>

      {/* 차트 영역 스켈레톤 */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-36" />
        </div>
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-36 w-full rounded-xl" />
      </div>
    </div>
  );
};

export default MainDashboardSkeleton;
