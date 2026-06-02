"use client";

import type { ReactElement } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts";
import type {
  ErrorStatPoint,
  ErrorStatsPeriod,
} from "@/entities/error/model/errorStats";
import { getYAxisTicks } from "@/entities/error/model/errorStatsUtils";
import { cn } from "@/shared/lib/utils";
import dayjs from "@/shared/lib/dayjs";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/ui/chart";

interface ErrorTimeChartProps {
  stats: ErrorStatPoint[];
  period: ErrorStatsPeriod;
  className?: string;
}

const formatLabel = (timestamp: number, period: ErrorStatsPeriod): string => {
  if (period === "24h") return dayjs.unix(timestamp).format("HH시");
  return dayjs.unix(timestamp).format("MM/DD");
};

const ErrorTimeChart = ({
  stats,
  period,
  className,
}: ErrorTimeChartProps): ReactElement => {
  const chartData = stats.map((s) => ({
    timestamp: s.timestamp,
    label: formatLabel(s.timestamp, period),
    count: s.count,
  }));

  const maxCount = Math.max(...chartData.map((d) => d.count), 0);
  const peakCount = maxCount;
  const ticks = getYAxisTicks(maxCount);

  const config: ChartConfig = {
    count: { label: "발생 횟수", color: "var(--color-error)" },
  };

  return (
    <ChartContainer
      config={config}
      className={cn("aspect-auto h-52", className)}
    >
      <BarChart
        data={chartData}
        accessibilityLayer
        margin={{ top: 10, left: -20 }}
      >
        <CartesianGrid vertical={false} stroke="var(--color-border-subtle)" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }}
          interval={0}
          minTickGap={0}
        />
        <YAxis
          ticks={ticks}
          domain={[0, ticks[ticks.length - 1]]}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }}
        />
        <ChartTooltip
          cursor={{ fill: "var(--color-bg-hover)" }}
          content={
            <ChartTooltipContent className="bg-bg-card border-border-base shadow-md" />
          }
          isAnimationActive={false}
          position={{ y: 0 }}
        />
        <Bar
          dataKey="count"
          radius={[6, 6, 0, 0]}
          isAnimationActive
          animationDuration={800}
          animationEasing="ease-out"
        >
          {chartData.map((entry) => (
            <Cell
              key={entry.timestamp}
              fill={
                entry.count === peakCount && peakCount > 0
                  ? "var(--color-warning)"
                  : "var(--color-error)"
              }
              fillOpacity={0.85}
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
};

export default ErrorTimeChart;
