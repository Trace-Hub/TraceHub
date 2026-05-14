import { cn } from "@/shared/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AddSquareIcon,
  ArrowReloadHorizontalIcon,
  Alert01Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";

interface ClassificationBadgeProps {
  variant: "new" | "dev" | "critical" | "longterm" | "none";
  className?: string;
}

const variantConfig = {
  new: {
    label: "신규",
    textClass: "text-primary",
    icon: AddSquareIcon,
  },
  dev: {
    label: "재발",
    textClass: "text-warning",
    icon: ArrowReloadHorizontalIcon,
  },
  critical: {
    label: "급증",
    textClass: "text-error",
    icon: Alert01Icon,
  },
  longterm: {
    label: "장기미해결",
    textClass: "text-text-secondary",
    icon: Clock01Icon,
  },
  none: {
    label: "없음",
    textClass: "text-text-tertiary",
    icon: null,
  },
} as const;

const ClassificationBadge = ({
  variant,
  className,
}: ClassificationBadgeProps) => {
  const { label, textClass, icon } = variantConfig[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1",
        "text-label font-medium",
        textClass,
        className,
      )}
    >
      {icon && (
        <HugeiconsIcon
          icon={icon}
          size={14}
          color="currentColor"
          strokeWidth={1.5}
        />
      )}
      {label}
    </span>
  );
};

export default ClassificationBadge;
