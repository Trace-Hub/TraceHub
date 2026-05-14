import { cn } from "@/shared/lib/utils";

interface StatusBadgeProps {
  variant: "unresolved" | "ignored" | "resolved";
  className?: string;
}

const variantConfig = {
  unresolved: {
    label: "미해결",
    textClass: "text-error",
  },
  ignored: {
    label: "무시됨",
    textClass: "text-text-secondary",
  },
  resolved: {
    label: "해결됨",
    textClass: "text-success",
  },
} as const;

const StatusBadge = ({
  variant,
  className,
}: StatusBadgeProps): React.ReactElement => {
  const { label, textClass } = variantConfig[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center",
        "text-label font-medium",
        textClass,
        className,
      )}
    >
      {label}
    </span>
  );
};

export default StatusBadge;
