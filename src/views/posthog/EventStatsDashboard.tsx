"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import { useEventStats } from "@/entities/event/api/getEventStats";
import type { Period as ApiPeriod } from "@/entities/event/model/eventStats";
import { getPeakLabel } from "@/entities/event/model/eventStatsUtils";
import PeriodTab, { type Period as TabPeriod } from "@/shared/ui/PeriodTab";
import EventBarChart from "@/views/posthog/EventBarChart";
import EventComparisonChart from "@/views/posthog/EventComparisonChart";
import EventLineChart from "@/views/posthog/EventLineChart";
import EventStatCard from "@/views/posthog/EventStatCard";

const CHART_COLORS = [
	"var(--color-primary)",
	"var(--color-success)",
	"var(--color-warning)",
	"var(--color-error)",
	"var(--color-surge)",
];

const TAB_TO_PERIOD: Record<TabPeriod, ApiPeriod> = {
	오늘: "day",
	"7일": "week",
	"30일": "month",
};

const EventStatsDashboard = (): ReactElement => {
	const [activeTab, setActiveTab] = useState<TabPeriod>("오늘");
	const period = TAB_TO_PERIOD[activeTab];
	const { data, isLoading, isError } = useEventStats(period);

	return (
		<div className="flex flex-col gap-6 p-6">
			<PeriodTab value={activeTab} onChange={setActiveTab} />

			{isLoading && (
				<p className="text-body2 text-text-secondary">불러오는 중...</p>
			)}
			{isError && (
				<p className="text-body2 text-error">데이터를 불러오지 못했습니다</p>
			)}
			{data?.events.length === 0 && (
				<p className="text-body2 text-text-tertiary">
					이벤트 데이터가 없습니다
				</p>
			)}

			{period !== "day" && data?.events && data.events.length > 0 && (
				<EventComparisonChart events={data.events} />
			)}

			{data?.events.map((ev, i) => (
				<EventStatCard
					key={ev.event}
					event={ev.event}
					currentTotal={ev.currentTotal}
					previousTotal={ev.previousTotal}
					peakLabel={getPeakLabel(ev.breakdown)}
					period={period}
				>
					{period === "day" ? (
						<EventBarChart
							breakdown={ev.breakdown}
							color={CHART_COLORS[i % CHART_COLORS.length]}
						/>
					) : (
						<EventLineChart
							breakdown={ev.breakdown}
							color={CHART_COLORS[i % CHART_COLORS.length]}
						/>
					)}
				</EventStatCard>
			))}
		</div>
	);
};

export default EventStatsDashboard;
