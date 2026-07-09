import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type {
  ErrorTagResponse,
  ErrorTagType,
} from "@/entities/error/model/errorStats";
import { apiClient } from "@/shared/api/client";

const getErrorTags = async (
  issueId: string,
  tag: ErrorTagType,
): Promise<ErrorTagResponse> => {
  const response = await apiClient(`/api/sentry/issues/${issueId}/tags/${tag}`);
  if (!response.ok) throw new Error("태그 데이터를 불러오는 데 실패했습니다");
  return response.json();
};

const useErrorTags = (
  issueId: string,
  tag: ErrorTagType,
): UseQueryResult<ErrorTagResponse, Error> => {
  return useQuery({
    queryKey: ["sentry", "issues", issueId, "tags", tag],
    queryFn: () => getErrorTags(issueId, tag),
    enabled: !!issueId,
  });
};

export { getErrorTags, useErrorTags };
