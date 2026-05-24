type ErrorStatus = "unresolved" | "ignored" | "resolved";

type ErrorLevel = "error" | "fatal" | "warning" | "info";

interface SentryIssue {
  id: string;
  title: string;
  culprit: string;
  status: ErrorStatus;
  level: ErrorLevel;
  count: string;
  userCount: number;
  firstSeen: string;
  lastSeen: string;
  isUnhandled: boolean;
  metadata: {
    type?: string;
    value?: string;
    filename?: string;
  };
  annotations: string[];
  shortId: string;
  permalink: string;
}

interface ErrorListResponse {
  issues: SentryIssue[];
}

type ErrorQueryParams = {
  status?: ErrorStatus;
  environment?: "production" | "development";
  query?: string;
};

export type {
  ErrorStatus,
  ErrorLevel,
  SentryIssue,
  ErrorListResponse,
  ErrorQueryParams,
};
