import type { ReactElement } from "react"
import PathsFlowTestNav from "@/views/posthog/PathsFlowTestNav"

interface PosthogSubPageProps {
	params: Promise<{ id: string }>
}

const PosthogSubPage = async ({ params }: PosthogSubPageProps): Promise<ReactElement> => {
	const { id } = await params

	return (
		<div className="min-h-screen bg-bg-base p-10 flex flex-col gap-6">
			<h1 className="text-h1 font-bold text-text-primary">/posthog/{id}</h1>
			<p className="text-body2 text-text-secondary">
				이 페이지를 방문하면 $pageview 이벤트가 자동으로 기록됩니다. (TRACKED_PATHS의
				&quot;/posthog/*&quot;에 포함되는 임의 하위 경로 테스트용)
			</p>
			<PathsFlowTestNav />
		</div>
	)
}

export default PosthogSubPage
