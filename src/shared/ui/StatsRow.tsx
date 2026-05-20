import { cn } from "@/shared/lib/utils";

interface StatsRowErrorProps {
  variant: "error";
  count: number;
  affectedUsers: number;
  firstSeen: string;
  lastSeen: string;
  className?: string;
}

interface StatsRowEventProps {
  variant: "event";
  count: number;
  previous: number;
  peakTime: string;
  className?: string;
}

type StatsRowProps = StatsRowErrorProps | StatsRowEventProps;

const StatsRow = (props: StatsRowProps): React.ReactElement => {
  const { variant, className } = props;

  return (
    <div
      className={cn(
        "w-full px-4 py-3",
        "rounded-xl border border-border-base",
        "bg-bg-base",
        "text-body2 text-text-primary",
        className,
      )}
    >
      {variant === "error" ? (
        <span>
          발생:{" "}
          <span className="font-medium">{props.count.toLocaleString()}회</span>
          {" · "}
          영향 사용자:{" "}
          <span className="font-medium">
            {props.affectedUsers.toLocaleString()}명
          </span>
          {" · "}
          최초: <span className="font-medium">{props.firstSeen}</span>
          {" · "}
          마지막: <span className="font-medium">{props.lastSeen}</span>
        </span>
      ) : (
        <span>
          발생:{" "}
          <span className="font-medium">{props.count.toLocaleString()}회</span>
          {" · "}
          이전:{" "}
          <span className="font-medium">
            {props.previous.toLocaleString()}회
          </span>
          {" · "}
          피크: <span className="font-medium">{props.peakTime}</span>
        </span>
      )}
    </div>
  );
};

export default StatsRow;
