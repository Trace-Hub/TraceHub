"use client"

import type { ReactElement } from "react"
import type {
	EventPropertyType,
	EventPropertyValue,
} from "@/entities/event/model/eventStats"
import { cn } from "@/shared/lib/utils"
import PercentageBarChart from "@/shared/ui/PercentageBarChart"


const PROPERTY_TABS: { label: string; value: EventPropertyType }[] = [
	{ label: "브라우저", value: "browser" },
	{ label: "OS", value: "os" },
	{ label: "페이지 경로", value: "current_url" },
	{ label: "직전 경로", value: "prev_pageview" },
]

interface EventDetailPropertySectionProps {
	activeProperty: EventPropertyType
	onPropertyChange: (property: EventPropertyType) => void
	values: EventPropertyValue[] | undefined
	isLoading: boolean
	isError: boolean
	className?: string
}

const EventDetailPropertySection = ({
	activeProperty,
	onPropertyChange,
	values,
	isLoading,
	isError,
	className,
}: EventDetailPropertySectionProps): ReactElement => {
	const hasData = !isLoading && !isError && values && values.length > 0
	const isEmpty = !isLoading && !isError && values && values.length === 0

	return (
		<section className={cn("flex flex-col gap-3", className)}>
			<h3 className="text-body2 font-medium text-text-primary">속성별 분포</h3>
			<div className="p-4 rounded-xl border border-border-base bg-bg-base">
				<div className="flex gap-1 mb-4">
					{PROPERTY_TABS.map((tab) => (
						<button
							key={tab.value}
							type="button"
							role="tab"
							aria-selected={activeProperty === tab.value}
							onClick={() => onPropertyChange(tab.value)}
							className={cn(
								"px-3 py-1 rounded-md text-caption font-medium transition-colors",
								activeProperty === tab.value
									? "bg-primary text-white"
									: "text-text-secondary hover:text-text-primary",
							)}
						>
							{tab.label}
						</button>
					))}
				</div>
				{isLoading && (
					<p className="text-caption text-text-tertiary py-8 text-center">로딩 중...</p>
				)}
				{isError && (
					<p className="text-body2 text-error py-8 text-center">
						데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
					</p>
				)}
				{hasData && <PercentageBarChart values={values} />}
				{isEmpty && (
					<p className="text-body2 text-text-tertiary py-8 text-center">
						데이터가 없습니다
					</p>
				)}
			</div>
		</section>
	)
}

export default EventDetailPropertySection