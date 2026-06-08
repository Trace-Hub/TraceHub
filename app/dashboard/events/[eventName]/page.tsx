import type { ReactElement } from "react"
import { getEventLabel } from "@/shared/config/eventLabel"
import EventDetailDashboard from "@/views/posthog/EventDetailDashboard"

interface EventDetailPageProps {
	params: Promise<{ eventName: string }>
}

const EventDetailPage = async ({ params }: EventDetailPageProps): Promise<ReactElement> => {
	const { eventName: rawEventName } = await params
	// URL 인코딩된 $pageview 같은 이벤트명 복원
	const eventName = decodeURIComponent(rawEventName)
	const label = getEventLabel(eventName)

	return (
		<div className="flex flex-col gap-6 p-6">
			<h2 className="text-h1 font-bold text-text-primary">{label}</h2>
			<EventDetailDashboard event={eventName} />
		</div>
	)
}

export default EventDetailPage