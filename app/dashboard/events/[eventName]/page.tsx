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
			{/* 이벤트 간 이동 시 컴포넌트를 remount해 차트 초기 애니메이션이 재실행되도록 함 */}
			<EventDetailDashboard key={eventName} event={eventName} />
		</div>
	)
}

export default EventDetailPage