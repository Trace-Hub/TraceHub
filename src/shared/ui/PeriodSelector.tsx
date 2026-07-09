"use client";

import { cn } from "@/shared/lib/utils";
import PeriodTab from "@/shared/ui/PeriodTab";
import type { Period } from "@/shared/ui/PeriodTab";

interface PeriodSelectorProps {
  value: Period;
  onChange: (value: Period) => void;
  className?: string;
}

const PeriodSelector = ({
  value,
  onChange,
  className,
}: PeriodSelectorProps): React.ReactElement => {
  return (
    <div
      className={cn(
        "inline-flex items-center",
        "px-1 py-1",
        "rounded-lg border border-border-base",
        "bg-bg-base",
        className,
      )}
    >
      <PeriodTab value={value} onChange={onChange} />
    </div>
  );
};

export default PeriodSelector;
export type { Period };
