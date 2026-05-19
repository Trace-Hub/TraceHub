"use client";

import { useState } from "react";
import { cn } from "@/shared/lib/utils";

type StatusFilterValue = "all" | "unresolved" | "ignored" | "resolved";

interface StatusFilterProps {
  value: StatusFilterValue;
  onChange: (value: StatusFilterValue) => void;
  className?: string;
}

const STATUS_OPTIONS: { value: StatusFilterValue; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "unresolved", label: "미해결" },
  { value: "ignored", label: "무시됨" },
  { value: "resolved", label: "해결됨" },
];

const StatusFilter = ({
  value,
  onChange,
  className,
}: StatusFilterProps): React.ReactElement => {
  const [selected, setSelected] = useState<StatusFilterValue>(value);

  const handleClick = (newValue: StatusFilterValue): void => {
    setSelected(newValue);
    onChange(newValue);
  };

  return (
    <div
      role="group"
      aria-label="상태 필터"
      className={cn("flex items-center gap-1", className)}
    >
      {STATUS_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={selected === option.value}
          onClick={() => handleClick(option.value)}
          className={cn(
            "px-3 py-1.5 rounded-md",
            "font-sans text-caption font-normal",
            "transition-interactive transition-fast",
            selected === option.value
              ? "bg-primary text-white hover:bg-primary-hover"
              : "text-text-secondary hover:bg-bg-hover",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default StatusFilter;
export type { StatusFilterValue };
