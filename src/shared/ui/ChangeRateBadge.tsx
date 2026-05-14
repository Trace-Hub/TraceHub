import { cn } from "@/shared/lib/utils";

interface ChangeRateBadgeProps {
  value: number;
  className?: string;
}

const ChangeRateBadge = ({ value, className }: ChangeRateBadgeProps) => {
  const isPositive = value > 0;
  const isNeutral = value === 0;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5",
        "text-label font-medium",
        isNeutral && "text-text-secondary",
        isPositive && "text-success",
        !isPositive && !isNeutral && "text-error",
        className,
      )}
    >
      {isNeutral ? (
        <span aria-hidden="true">—</span>
      ) : isPositive ? (
        <span aria-hidden="true">▲</span>
      ) : (
        <span aria-hidden="true">▼</span>
      )}
      {isNeutral ? "0%" : `${isPositive ? "+" : ""}${value}%`}
    </span>
  );
};

export default ChangeRateBadge;
