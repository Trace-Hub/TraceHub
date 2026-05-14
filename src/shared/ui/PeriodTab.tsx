"use client";

import { cn } from "@/shared/lib/utils";

type Period = "오늘" | "7일" | "30일";

interface PeriodTabProps {
  value: Period;
  onChange: (value: Period) => void;
  className?: string;
}

const PERIODS: Period[] = ["오늘", "7일", "30일"];

const PeriodTab = ({ value, onChange, className }: PeriodTabProps) => {
  return (
    <div
      role="tablist"
      aria-label="기간 선택"
      className={cn("inline-flex items-center gap-1", className)}
    >
      {PERIODS.map((period) => (
        <button
          key={period}
          role="tab"
          type="button"
          aria-selected={value === period}
          onClick={() => onChange(period)}
          className={cn(
            "px-3 py-1.5 rounded-md",
            "text-body2 font-medium",
            "transition-[background-color,color] duration-150 ease",
            value === period
              ? "bg-primary text-white"
              : "text-text-secondary hover:text-text-primary",
          )}
        >
          {period}
        </button>
      ))}
    </div>
  );
};

export default PeriodTab;
export type { Period };
