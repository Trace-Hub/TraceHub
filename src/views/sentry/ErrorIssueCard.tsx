"use client";

import type { ReactElement } from "react";
import type { SentryIssue } from "@/entities/error/model/errorStats";
import ErrorDetailDashboard from "@/views/sentry/ErrorDetailDashboard";
import { cn } from "@/shared/lib/utils";

interface ErrorIssueCardProps {
  issue: SentryIssue;
  isSelected: boolean;
  onClick: () => void;
  className?: string;
}

const ErrorIssueCard = ({
  issue,
  isSelected,
  onClick,
  className,
}: ErrorIssueCardProps): ReactElement => {
  return (
    <div className={cn("flex flex-col", className)}>
      <button
        type="button"
        onClick={onClick}
        className="p-4 rounded-xl border border-border-base bg-bg-base text-left hover:bg-bg-hover transition-colors"
      >
        <span className="text-body2 font-medium text-text-primary block">
          {issue.title}
        </span>
        <p className="text-caption text-text-tertiary mt-1">{issue.culprit}</p>
        <p className="text-caption text-text-secondary mt-1">
          발생: {issue.count}회 · 영향 사용자: {issue.userCount}명 · 마지막:{" "}
          {new Date(issue.lastSeen).toLocaleString("ko-KR")}
        </p>
      </button>

      {isSelected && (
        <div className="mt-2 pl-4 border-l-2 border-primary">
          <ErrorDetailDashboard issue={issue} />
        </div>
      )}
    </div>
  );
};

export default ErrorIssueCard;
