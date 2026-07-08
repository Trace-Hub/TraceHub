"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactElement } from "react"
import { cn } from "@/shared/lib/utils"

// Paths 대시보드(경로 흐름) 테스트용 — 여기서 링크를 클릭해 페이지를 오가면
// PageviewTracker가 자동으로 $pageview를 기록해 실제 이동 데이터가 쌓인다
const TEST_NAV_LINKS = [
	{ href: "/", label: "/ (루트)" },
	{ href: "/posthog", label: "/posthog" },
	{ href: "/posthog/1", label: "/posthog/1" },
	{ href: "/posthog/2", label: "/posthog/2" },
	{ href: "/posthog/3", label: "/posthog/3" },
	{ href: "/sentry-test", label: "/sentry-test" },
] as const

const PathsFlowTestNav = (): ReactElement => {
	const pathname = usePathname()

	return (
		<nav
			aria-label="경로 흐름 테스트 이동"
			className="flex flex-wrap items-center gap-2 p-4 rounded-lg border border-border-subtle bg-bg-card"
		>
			<span className="text-caption text-text-tertiary mr-2">
				경로 흐름 테스트: 아래 링크를 오가며 이동한 뒤 Paths 대시보드에서 시작점을 선택해 확인하세요
			</span>
			{TEST_NAV_LINKS.map((link) => (
				<Link
					key={link.href}
					href={link.href}
					className={cn(
						"px-3 py-1.5 rounded-md text-body2 border transition-colors duration-150",
						pathname === link.href
							? "bg-primary text-white border-primary"
							: "border-border-base text-text-secondary hover:bg-bg-hover",
					)}
				>
					{link.label}
				</Link>
			))}
		</nav>
	)
}

export default PathsFlowTestNav
