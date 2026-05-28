import type { ReactElement } from "react";
import ErrorDetailView from "@/views/sentry/ErrorDetailView";

interface ErrorDetailPageProps {
  params: Promise<{ id: string }>;
}

const ErrorDetailPage = async ({
  params,
}: ErrorDetailPageProps): Promise<ReactElement> => {
  const { id } = await params;
  return <ErrorDetailView issueId={id} />;
};

export default ErrorDetailPage;
