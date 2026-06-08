"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import { useEventStats } from "@/entities/event/api/getEventStats";
import { EVENT_TAB_TO_PERIOD } from "@/entities/event/model/eventStats";
import { getPeakLabel } from "@/entities/event/model/eventStatsUtils";
import { CHART_COLOR_PALETTE } from "@/shared/config/chartColors";
import PeriodTab, { type Period as TabPeriod } from "@/shared/ui/PeriodTab";
import EventBarChart from "@/views/posthog/EventBarChart";
import EventComparisonChart from "@/views/posthog/EventComparisonChart";
import EventLineChart from "@/views/posthog/EventLineChart";
import EventStatCard from "@/views/posthog/EventStatCard";

const EventStatsDashboard = (): ReactElement => {
	const [activeTab, setActiveTab] = useState<TabPeriod>("오늘");
	const period = EVENT_TAB_TO_PERIOD[activeTab];
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
							color={CHART_COLOR_PALETTE[i % CHART_COLOR_PALETTE.length]}
						/>
					) : (
						<EventLineChart
							breakdown={ev.breakdown}
							color={CHART_COLOR_PALETTE[i % CHART_COLOR_PALETTE.length]}
						/>
					)}
				</EventStatCard>
			))}
		</div>
	);
};

export default EventStatsDashboard;
