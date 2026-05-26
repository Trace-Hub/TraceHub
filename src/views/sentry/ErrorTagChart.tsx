"use client";

import type { ReactElement } from "react";
import { Bar, BarChart, XAxis, YAxis, Cell } from "recharts";
import type { ErrorTagValue } from "@/entities/error/model/errorStats";
import { cn } from "@/shared/lib/utils";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/ui/chart";

interface ErrorTagChartProps {
  values: ErrorTagValue[];
  className?: string;
}

const ErrorTagChart = ({
  values,
  className,
}: ErrorTagChartProps): ReactElement => {
  const config: ChartConfig = {
    percentage: { label: "비율", color: "var(--color-primary)" },
  };

  const chartData = values.map((v) => ({
    label: v.value,
    percentage: v.percentage,
    count: v.count,
  }));

  return (
    <ChartContainer
      config={config}
      className={cn(`aspect-auto`, className)}
      // 항목 수에 따라 동적으로 높이 조정 (Tailwind로 표현 불가)
      style={{ height: Math.max(chartData.length * 48, 80) }}
    >
      <BarChart
        data={chartData}
        layout="vertical"
        accessibilityLayer
        margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
      >
        <XAxis
          type="number"
          domain={[0, 100]}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }}
          tickFormatter={(v) => `${v}%`}
          ticks={[0, 25, 50, 75, 100]}
        />
        <YAxis
          type="category"
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }}
          width={80}
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
          dataKey="percentage"
          radius={[0, 4, 4, 0]}
          isAnimationActive
          animationDuration={800}
          animationEasing="ease-out"
        >
          {chartData.map((entry) => (
            <Cell
              key={entry.label}
              fill="var(--color-primary)"
              fillOpacity={0.85}
              stroke="var(--color-primary)"
              strokeWidth={1}
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
};

export default ErrorTagChart;
