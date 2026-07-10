"use client";

import { useState, useEffect } from "react";
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
  barColor?: string;
  peakColor?: string;
  labels?: string[];
}

const formatLabel = (timestamp: number, period: ErrorStatsPeriod): string => {
  if (period === "24h") return dayjs.unix(timestamp).format("HH시");
  return dayjs.unix(timestamp).format("MM/DD");
};

const ErrorTimeChart = ({
  stats,
  period,
  className,
  barColor = "var(--color-error)",
  peakColor = "var(--color-warning)",
  labels,
}: ErrorTimeChartProps): ReactElement => {
  // X축 반응형: period에 따라 데스크탑/태블릿/모바일 간격 조절
  const [xInterval, setXInterval] = useState(0);

  useEffect(() => {
    const updateInterval = (): void => {
      const width = window.innerWidth;
      if (period === "24h") {
        if (width >= 1280) setXInterval(0);
        else if (width >= 744) setXInterval(1);
        else setXInterval(3);
      } else if (period === "30d") {
        if (width >= 1280) setXInterval(0);
        else if (width >= 744) setXInterval(1);
        else setXInterval(4);
      } else {
        setXInterval(0);
      }
    };
    updateInterval();
    window.addEventListener("resize", updateInterval);
    return () => window.removeEventListener("resize", updateInterval);
  }, [period]);

  const chartData = stats.map((s, i) => ({
    timestamp: s.timestamp,
    label: labels?.[i] ?? formatLabel(s.timestamp, period),
    count: s.count,
  }));

  const maxCount = Math.max(...chartData.map((d) => d.count), 0);
  const peakCount = maxCount;
  const ticks = getYAxisTicks(maxCount);

  const config: ChartConfig = {
    count: { label: "발생 횟수", color: barColor },
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
          interval={xInterval}
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
                  ? peakColor
                  : barColor
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
