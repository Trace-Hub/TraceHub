import { Suspense } from "react";
import type { ReactElement } from "react";
import ErrorListView from "@/views/sentry/ErrorListView";
import ErrorListSkeleton from "@/views/sentry/ErrorListSkeleton";

const ErrorListPage = (): ReactElement => {
  return (
    <Suspense fallback={<ErrorListSkeleton />}>
      <ErrorListView />
    </Suspense>
  );
};

export default ErrorListPage;
