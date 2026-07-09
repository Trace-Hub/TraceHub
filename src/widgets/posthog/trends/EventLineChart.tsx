"use client"

import type { ReactElement } from "react"
import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts"
import type { EventPeriodCount } from "@/entities/event/model/eventStats"
import { calcAverage, getYAxisTicks } from "@/entities/event/model/eventStatsUtils"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/shared/ui/chart"
import { cn } from "@/shared/lib/utils"

interface EventLineChartProps {
    breakdown: EventPeriodCount[]
    color: string
    className?: string
}

const EventLineChart = ({ breakdown, color, className }: EventLineChartProps): ReactElement => {
    const maxValue = Math.max(...breakdown.map((b) => b.count), 0)
    const ticks = getYAxisTicks(maxValue)
    const average = calcAverage(breakdown)
    const xAxisTicks = breakdown.length > 7
        ? breakdown
            .filter((_, i) => i % 5 === 0 || i === breakdown.length - 1)
            .map((b) => b.label)
        : breakdown.map((b) => b.label)

    const config: ChartConfig = {
        count: { label: "발생 횟수", color },
    }

    return (
        <ChartContainer config={config} className={cn("aspect-auto h-52", className)}>
            <LineChart data={breakdown} accessibilityLayer margin={{ top: 10, left: -20, right: 20}}>
                <CartesianGrid vertical={false} stroke="var(--color-border-subtle)" />
                <XAxis
                    dataKey="label"
                    ticks={xAxisTicks}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }}
                />
                <YAxis
                    ticks={ticks}
                    domain={[0, ticks[ticks.length - 1]]}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }}
                />
                <ChartTooltip
                    cursor={{ stroke: "var(--color-border-base)", strokeWidth: 1 }}
                    content={<ChartTooltipContent className="bg-bg-card border-border-base shadow-md" />}
                    isAnimationActive={false}
                />
                <ReferenceLine
                    y={average}
                    stroke="var(--color-text-tertiary)"
                    strokeDasharray="4 4"
                    strokeWidth={1}
                />
                <Line
                    type="monotone"
                    dataKey="count"
                    stroke="var(--color-count)"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "var(--color-count)", strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: "var(--color-count)", strokeWidth: 0 }}
                    isAnimationActive
                    animationDuration={800}
                    animationEasing="ease-out"
                />
            </LineChart>
        </ChartContainer>
    )
}

export default EventLineChart
