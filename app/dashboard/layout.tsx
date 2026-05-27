import type { JSX } from "react"
import Sidebar from "@/shared/ui/Sidebar"

interface DashboardLayoutProps {
	children: React.ReactNode
}

const DashboardLayout = ({ children }: DashboardLayoutProps): JSX.Element => {
	return (
		<div className="flex min-h-full">
			<Sidebar />
			<main className="flex-1 min-w-0 overflow-auto pt-14 lg:pt-0">
				{children}
			</main>
		</div>
	)
}

export default DashboardLayout