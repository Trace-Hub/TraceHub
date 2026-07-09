import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { SentryIssue } from "@/entities/error/model/errorStats";
import { apiClient } from "@/shared/api/client";

const getErrorDetail = async (issueId: string): Promise<SentryIssue> => {
  const response = await apiClient(`/api/sentry/issues/${issueId}`);
  if (!response.ok) throw new Error("이슈 데이터를 불러오는 데 실패했습니다");
  return response.json();
};

const useErrorDetail = (
  issueId: string,
): UseQueryResult<SentryIssue, Error> => {
  return useQuery({
    queryKey: ["sentry", "issues", issueId],
    queryFn: () => getErrorDetail(issueId),
    enabled: !!issueId,
  });
};

export { getErrorDetail, useErrorDetail };
