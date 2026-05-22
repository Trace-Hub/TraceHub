"use client";

import type { ReactElement } from "react";
import { useEventStats } from "@/entities/event/api/getEventStats";

const EventStatsDashboard = (): ReactElement => {
    const day = useEventStats("day");
    const week = useEventStats("week");
    const month = useEventStats("month");

    return (
        <div className="flex flex-col gap-8 p-4 text-xs">
            <section>
                <h2 className="mb-2 font-bold">day</h2>
                {day.isLoading && <p>불러오는 중...</p>}
                {day.isError && <p>오류 발생</p>}
                <pre className="whitespace-pre-wrap break-all">{JSON.stringify(day.data, null, 2)}</pre>
            </section>
            <section>
                <h2 className="mb-2 font-bold">week</h2>
                {week.isLoading && <p>불러오는 중...</p>}
                {week.isError && <p>오류 발생</p>}
                <pre className="whitespace-pre-wrap break-all">{JSON.stringify(week.data, null, 2)}</pre>
            </section>
            <section>
                <h2 className="mb-2 font-bold">month</h2>
                {month.isLoading && <p>불러오는 중...</p>}
                {month.isError && <p>오류 발생</p>}
                <pre className="whitespace-pre-wrap break-all">{JSON.stringify(month.data, null, 2)}</pre>
            </section>
        </div>
    );
};

export default EventStatsDashboard;
