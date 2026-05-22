"use client"

import type {ReactElement} from "react"
import {Bar, BarChart, CartesianGrid, XAxis, YAxis} from "recharts"
import type {EventPeriodCount} from "@/entities/event/model/eventStats"
import {getYAxisTicks} from "@/entities/event/model/eventStatsUtils"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/shared/ui/chart"
import {cn} from "@/shared/lib/utils"

interface EventBarChartProps {
    breakdown: EventPeriodCount[]
    color: string
    className?: string
}

const EventBarChart = ({breakdown, color, className}: EventBarChartProps): ReactElement => {
    const maxValue = Math.max(...breakdown.map((b) => b.count), 0)
    const ticks = getYAxisTicks(maxValue)
    const peakIndex = breakdown.reduce(
        (maxIdx, b, i, arr) => (b.count > arr[maxIdx].count ? i : maxIdx),
        0
    )
    const chartData = breakdown.map((b, i) => ({
        ...b,
        fillOpacity: i === peakIndex ? 1 : 0.75,
    }))

    const config: ChartConfig = {
        count: {label: "발생 횟수", color},
    }

    return (
        <ChartContainer config={config} className={cn("aspect-auto h-52", className)}>
            <BarChart data={chartData} accessibilityLayer margin={{top: 10, left: -20}}>
                <CartesianGrid vertical={false} stroke="var(--color-border-subtle)"/>
                <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{fontSize: 11, fill: "var(--color-text-tertiary)"}}
                />
                <YAxis
                    ticks={ticks}
                    domain={[0, ticks[ticks.length - 1]]}
                    tickLine={false}
                    axisLine={false}
                    tick={{fontSize: 11, fill: "var(--color-text-tertiary)"}}
                />
                <ChartTooltip
                    cursor={{fill: "var(--color-bg-hover)"}}
                    content={<ChartTooltipContent/>}
                />
                <Bar
                    dataKey="count"
                    fill="var(--color-count)"
                    fillOpacity="fillOpacity"
                    radius={[2, 2, 0, 0]}
                    isAnimationActive
                    animationDuration={800}
                    animationEasing="ease-out"
                />
            </BarChart>
        </ChartContainer>
    )
}

export default EventBarChart
