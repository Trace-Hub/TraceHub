import type { EventPeriodCount, Period } from "@/entities/event/model/eventStats"

interface HogQLQueries {
	current: string
	previous: string
}

function buildQueries(period: Period): HogQLQueries {
	switch (period) {
		case "day":
			return {
				current: `
          SELECT event, toHour(timestamp) AS unit, count() AS count
          FROM events
          WHERE toDate(timestamp) = today()
          GROUP BY event, unit
          ORDER BY event, unit ASC
        `,
				previous: `
          SELECT event, count() AS count
          FROM events
          WHERE toDate(timestamp) = yesterday()
          GROUP BY event
        `,
			}
		case "week":
			return {
				current: `
          SELECT event, toDate(timestamp) AS unit, count() AS count
          FROM events
          WHERE timestamp >= now() - INTERVAL 7 DAY
          GROUP BY event, unit
          ORDER BY event, unit ASC
        `,
				previous: `
          SELECT event, count() AS count
          FROM events
          WHERE timestamp >= now() - INTERVAL 14 DAY
            AND timestamp < now() - INTERVAL 7 DAY
          GROUP BY event
        `,
			}
		case "month":
			return {
				current: `
          SELECT event, toDate(timestamp) AS unit, count() AS count
          FROM events
          WHERE timestamp >= now() - INTERVAL 30 DAY
          GROUP BY event, unit
          ORDER BY event, unit ASC
        `,
				previous: `
          SELECT event, count() AS count
          FROM events
          WHERE timestamp >= now() - INTERVAL 60 DAY
            AND timestamp < now() - INTERVAL 30 DAY
          GROUP BY event
        `,
			}
	}
}

function buildEmptyBreakdown(period: Period): EventPeriodCount[] {
	if (period === "day") {
		return Array.from({ length: 24 }, (_, h) => ({ label: `${h}시`, count: 0 }))
	}

	const days = period === "week" ? 7 : 30
	return Array.from({ length: days }, (_, i) => {
		const d = new Date()
		d.setDate(d.getDate() - (days - 1) + i)
		const month = String(d.getMonth() + 1).padStart(2, "0")
		const day = String(d.getDate()).padStart(2, "0")
		return { label: `${month}/${day}`, count: 0 }
	})
}

function toLabel(unit: string | number, period: Period): string {
	if (period === "day") {
		return `${Number(unit)}시`
	}
	// unit은 "YYYY-MM-DD" 형식
	const parts = String(unit).split("-")
	return `${parts[1]}/${parts[2]}`
}

export { buildQueries, buildEmptyBreakdown, toLabel }