type ErrorStatus = "unresolved" | "ignored" | "resolved";

type ErrorLevel = "error" | "fatal" | "warning" | "info";

type ErrorStatsPeriod = "24h" | "7d" | "30d";

type ErrorTagType = "browser.name" | "os.name" | "environment";

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

interface ErrorStatPoint {
  timestamp: number;
  count: number;
}

interface ErrorStatsResponse {
  issueId: string;
  period: ErrorStatsPeriod;
  stats: ErrorStatPoint[];
}

interface ErrorTagValue {
  value: string;
  count: number;
  percentage: number;
}

interface ErrorTagResponse {
  issueId: string;
  tag: ErrorTagType;
  values: ErrorTagValue[];
}

export type {
  ErrorStatus,
  ErrorLevel,
  ErrorStatsPeriod,
  ErrorTagType,
  SentryIssue,
  ErrorListResponse,
  ErrorQueryParams,
  ErrorStatPoint,
  ErrorStatsResponse,
  ErrorTagValue,
  ErrorTagResponse,
};
