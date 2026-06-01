"use client"

import {useState} from "react"
import {HugeiconsIcon} from "@hugeicons/react"
import {ArrowDown01Icon, ArrowUp01Icon} from "@hugeicons/core-free-icons"

interface IntegrationGuideProps {
	title: string
	guide: Record<string, string>
	docsUrl: string
}

const IntegrationGuide = ({title, guide, docsUrl}: IntegrationGuideProps) => {
	const [isGuideOpen, setIsGuideOpen] = useState(false)

	const handleGuideToggle = (): void => {
		setIsGuideOpen((prev) => !prev)
	}

	return (
		<div className="flex flex-col gap-2">
			<button
				type="button"
				onClick={handleGuideToggle}
				aria-expanded={isGuideOpen}
				aria-label={`${title} 설정 가이드 ${isGuideOpen ? "닫기" : "열기"}`}
				className="flex flex-row items-center gap-1 text-body2 text-text-tertiary hover:text-text-secondary transition-interactive w-fit"
			>
				<HugeiconsIcon icon={isGuideOpen ? ArrowUp01Icon : ArrowDown01Icon} size={14} color="currentColor" strokeWidth={1.5}/>
				설정 가이드
			</button>

			{isGuideOpen && (
				<div className="flex flex-col gap-3 px-4 py-3 rounded-md bg-bg-subtle border border-border-subtle">
					<ul className="flex flex-col gap-3">
						{Object.entries(guide).map(([key, description]) => (
							<li key={key} className="flex flex-col gap-1">
								<span className="font-mono text-body2 font-medium text-text-primary">{key}</span>
								<span className="text-body2 text-text-secondary whitespace-pre-line">{description}</span>
							</li>
						))}
					</ul>
					<a
						href={docsUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="text-body2 text-primary hover:text-primary-hover transition-interactive w-fit"
					>
						공식 문서 확인
					</a>
				</div>
			)}
		</div>
	)
}

export default IntegrationGuide