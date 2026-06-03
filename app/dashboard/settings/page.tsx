import type {JSX} from "react"
import IntegrationCard from "@/features/settings/ui/IntegrationCard"

const SettingsPage = (): JSX.Element => {
    return (
        <div className="p-6 flex flex-col gap-6 w-full">
            <h1 className="text-display font-medium text-text-primary">설정</h1>
            <section className="flex flex-col gap-4">
                <h2 className="text-body1 font-medium text-text-secondary">Sentry와 PostHog가 정상적으로 연동되었는지 확인합니다.</h2>
                <IntegrationCard service="sentry"/>
                <IntegrationCard service="posthog"/>
            </section>
        </div>
    )
}

export default SettingsPage