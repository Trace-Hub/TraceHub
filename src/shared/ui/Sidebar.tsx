"use client"

import type { JSX } from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "motion/react"
import { cn } from "@/shared/lib/utils"
import THIcon from "@/shared/ui/icons/THIcon"
import MenuIcon from "@/shared/ui/icons/MenuIcon"
import { NAV_ITEMS } from "@/shared/config/navigation"

const SIDEBAR_ID = "dashboard-sidebar"

const ChevronIcon = ({ isOpen }: { isOpen: boolean }): JSX.Element => (
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="none"
		aria-hidden="true"
		className={cn("ml-auto transition-transform duration-200", isOpen && "rotate-180")}
	>
		<path
			d="M4 6l4 4 4-4"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
)

const Sidebar = (): JSX.Element => {
	const pathname = usePathname()
	const [isOpen, setIsOpen] = useState(false)
	// lazy initializer로 pathname 기반 초기값을 동기 계산 — useEffect 방식은 첫 렌더에서 flash 유발
	const [expandedItems, setExpandedItems] = useState<Set<string>>(() => {
		const initial = new Set<string>()
		for (const item of NAV_ITEMS) {
			if (item.children && pathname.startsWith(item.href)) {
				initial.add(item.href)
			}
		}
		return initial
	})

	const handleClose = () => setIsOpen(false)

	const toggleExpanded = (href: string) => {
		setExpandedItems((prev) => {
			const next = new Set(prev)
			if (next.has(href)) {
				next.delete(href)
			} else {
				next.add(href)
			}
			return next
		})
	}

	// 클라이언트 사이드 네비게이션으로 하위 경로 진입 시 부모 메뉴 자동 펼침
	useEffect(() => {
		for (const item of NAV_ITEMS) {
			if (item.children && pathname.startsWith(item.href)) {
				setExpandedItems((prev) => {
					if (prev.has(item.href)) return prev
					const next = new Set(prev)
					next.add(item.href)
					return next
				})
			}
		}
	}, [pathname])

	useEffect(() => {
		if (!isOpen) return
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") setIsOpen(false)
		}
		window.addEventListener("keydown", onKeyDown)
		return () => window.removeEventListener("keydown", onKeyDown)
	}, [isOpen])

	return (
		<>
			{/* 햄버거 버튼 - 태블릿/모바일에서만 노출 */}
			<button
				type="button"
				className="fixed top-4 left-4 z-30 p-2 rounded-md bg-bg-card border border-border-subtle lg:hidden"
				onClick={() => setIsOpen(true)}
				aria-expanded={isOpen}
				aria-controls={SIDEBAR_ID}
				aria-label="메뉴 열기"
			>
				<MenuIcon />
			</button>

			{/* 오버레이 - 태블릿/모바일에서 사이드바 열릴 때 배경 어둡게 */}
			{isOpen && (
				<div
					className="fixed inset-0 z-40 bg-black/50 lg:hidden"
					onClick={handleClose}
					aria-hidden="true"
				/>
			)}

			{/* 사이드바 패널 */}
			<aside
				id={SIDEBAR_ID}
				className={cn(
					"fixed inset-y-0 left-0 z-50 flex flex-col",
					"w-55 bg-bg-card border-r border-border-subtle",
					"transition-transform duration-300 ease-in-out",
					// 닫힌 상태에서 pointer-events 차단 — off-screen aside가 버튼 클릭을 가로채는 것 방지
					isOpen ? "translate-x-0 pointer-events-auto" : "-translate-x-full pointer-events-none",
					// PC: 항상 노출, 레이아웃 흐름에 포함
					"lg:static lg:translate-x-0 lg:z-auto lg:min-h-screen lg:pointer-events-auto",
				)}
				aria-label="사이드바 네비게이션"
			>
				{/* 로고 */}
				<div className="flex items-center gap-3 px-4 py-5 border-b border-border-subtle">
					<THIcon />
					<span className="text-h1 font-bold text-text-primary">TraceHub</span>
					{/* 사이드바 내부 닫기 버튼 - 모바일/태블릿 전용 */}
					<button
						type="button"
						onClick={handleClose}
						className="ml-auto p-1 text-text-secondary hover:text-text-primary lg:hidden"
						aria-label="메뉴 닫기"
					>
						<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
							<path
								d="M15 5L5 15M5 5l10 10"
								stroke="currentColor"
								strokeWidth="1.67"
								strokeLinecap="round"
							/>
						</svg>
					</button>
				</div>

				{/* 네비게이션 메뉴 */}
				<nav className="flex-1 py-2">
					{NAV_ITEMS.map((item) => {
						const { label, href, exact, icon: Icon, children } = item

						if (children) {
							const isExpanded = expandedItems.has(href)
							const isParentActive = pathname.startsWith(`${href}/`)

							const subMenuId = `subnav-${href.replace(/\//g, "-")}`

							return (
								<div key={href}>
									<button
										type="button"
										onClick={() => toggleExpanded(href)}
										className={cn(
											"w-full flex items-center gap-3 px-4 py-3",
											"border-l-2 transition-interactive",
											isParentActive
												? "border-l-primary text-primary"
												: "border-l-transparent text-text-secondary hover:text-text-primary hover:bg-bg-hover",
										)}
										aria-expanded={isExpanded}
										aria-controls={subMenuId}
									>
										{Icon && <Icon color={isParentActive ? "var(--color-primary)" : undefined} />}
										<span className="text-body1 font-medium">{label}</span>
										<ChevronIcon isOpen={isExpanded} />
									</button>

									<AnimatePresence initial={false}>
									{isExpanded && (
										<motion.ul
											id={subMenuId}
											initial={{ height: 0, opacity: 0 }}
											animate={{ height: "auto", opacity: 1 }}
											exit={{ height: 0, opacity: 0 }}
											transition={{ duration: 0.2, ease: "easeInOut" }}
											className="overflow-hidden"
										>
											{children.map((child) => {
												const isChildActive =
													pathname === child.href || pathname.startsWith(`${child.href}/`)

												return (
													<li key={child.href}>
														<Link
															href={child.href}
															onClick={handleClose}
															className={cn(
																"flex items-center pl-11 pr-4 py-2",
																"border-l-2 transition-interactive",
																isChildActive
																	? "border-l-primary text-primary"
																	: "border-l-transparent text-text-secondary hover:text-text-primary hover:bg-bg-hover",
															)}
															aria-current={isChildActive ? "page" : undefined}
														>
															<span className="text-body2 font-medium">{child.label}</span>
														</Link>
													</li>
												)
											})}
										</motion.ul>
									)}
								</AnimatePresence>
								</div>
							)
						}

						const isActive = exact
							? pathname === href
							: pathname === href || pathname.startsWith(`${href}/`)

						return (
							<Link
								key={href}
								href={href}
								onClick={handleClose}
								className={cn(
									"flex items-center gap-3 px-4 py-3",
									"border-l-2 transition-interactive",
									isActive
										? "border-l-primary text-primary"
										: "border-l-transparent text-text-secondary hover:text-text-primary hover:bg-bg-hover",
								)}
								aria-current={isActive ? "page" : undefined}
							>
								{Icon && <Icon color={isActive ? "var(--color-primary)" : undefined} />}
								<span className="text-body1 font-medium">{label}</span>
							</Link>
						)
					})}
				</nav>
			</aside>
		</>
	)
}

export default Sidebar
