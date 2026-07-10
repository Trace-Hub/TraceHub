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
  httpStatusCode?: string;
  environment?: string;
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

// Sentry stats API에서 공통으로 사용하는 기간 관련 상수
const VALID_PERIODS: ErrorStatsPeriod[] = ["24h", "7d", "30d"];

const PERIOD_INTERVAL: Record<ErrorStatsPeriod, string> = {
  "24h": "1h",
  "7d": "1d",
  "30d": "1d",
};

const PERIOD_LIMIT: Record<ErrorStatsPeriod, number> = {
  "24h": 24,
  "7d": 7,
  "30d": 30,
};

export { VALID_PERIODS, PERIOD_INTERVAL, PERIOD_LIMIT };
