"use client"

import {cn} from "@/shared/lib/utils"
import {JSX} from "react";
import {SERVICE_CONFIG} from "@/features/settings/model/integrationConfig"
import useConnectionTest from "@/features/settings/model/useConnectionTest"
import type {ServiceType} from "@/features/settings/model/integrationTypes"
import Button from "@/shared/ui/Button"
import CodeBlock from "@/shared/ui/CodeBlock"
import ConnectionStatusBadge from "@/shared/ui/ConnectionStatusBadge"
import ConnectionStatusBox from "@/shared/ui/ConnectionStatusBox"
import IntegrationGuide from "@/features/settings/ui/IntegrationGuide"

interface IntegrationCardProps {
    service: ServiceType
    className?: string
}

const IntegrationCard = ({service, className}: IntegrationCardProps): JSX.Element => {
    const {testStatus, failMessage, handleTest} = useConnectionTest(service)
    const {title, envKeys, guide, docsUrl} = SERVICE_CONFIG[service]

    const codeContent = `# 환경 변수 설정 (필수)\n${envKeys.map((key) => `${key}=********`).join("\n")}`
    const badgeVariant: "connected" | "disconnected" | "failed" =
        testStatus === "success" ? "connected" : testStatus === "failed" ? "failed" : "disconnected"

    return (
        <div
            className={cn(
                "flex flex-col gap-4",
                "p-5 rounded-xl",
                "border border-border-subtle bg-bg-card",
                className,
            )}
        >
            <div className="flex flex-row items-center justify-between">
                <span className="text-h1 font-medium text-text-primary">{title}</span>
                <ConnectionStatusBadge variant={badgeVariant}/>
            </div>

            <CodeBlock code={codeContent}/>

            <div className="flex flex-row gap-2 w-full">
                <Button
                    variant="secondary"
                    disabled={testStatus === "loading"}
                    onClick={handleTest}
                    aria-label={`${title} 연결 테스트`}
                    className="max-w-xl"
                >
                    연결 테스트
                </Button>
                {testStatus !== "idle" &&
                    <ConnectionStatusBox status={testStatus} message={failMessage} className="flex-1"/>}
            </div>

            <IntegrationGuide title={title} guide={guide} docsUrl={docsUrl}/>
        </div>
    )
}

export default IntegrationCard
