import { cn } from "@/shared/lib/utils";

interface SurgeDetailProps {
  weeklyAvg: number;
  todayCount: number;
  surgeMultiple: number;
  forecast?: string;
  className?: string;
}

const SurgeDetail = ({
  weeklyAvg,
  todayCount,
  surgeMultiple,
  forecast,
  className,
}: SurgeDetailProps): React.ReactElement => {
  return (
    <div
      className={cn(
        "w-full px-4 py-3",
        "rounded-xl border border-surge/30",
        "bg-surge-subtle",
        className,
      )}
    >
      <p className="text-body2 text-text-primary">
        7일 평균:{" "}
        <span className="font-medium">{weeklyAvg.toLocaleString()}회</span>
        {" · "}
        오늘:{" "}
        <span className="font-medium text-surge">
          {todayCount.toLocaleString()}회 · {surgeMultiple}배 급증
        </span>
      </p>
      {forecast && (
        <p className="mt-1 text-body2 text-text-secondary border-l-2 border-surge pl-2">
          + {forecast}
        </p>
      )}
    </div>
  );
};

export default SurgeDetail;
