"use client"

import {useState} from "react"
import {TEST_FN, REASON_MESSAGE} from "@/features/settings/model/integrationConfig"
import type {ServiceType, TestStatus} from "@/features/settings/model/integrationTypes"

interface UseConnectionTestReturn {
	testStatus: TestStatus
	failMessage: string | undefined
	handleTest: () => Promise<void>
}

const useConnectionTest = (service: ServiceType): UseConnectionTestReturn => {
	const [testStatus, setTestStatus] = useState<TestStatus>("idle")
	const [failMessage, setFailMessage] = useState<string | undefined>(undefined)

	const handleTest = async (): Promise<void> => {
		setTestStatus("loading")
		setFailMessage(undefined)
		try {
			const result = await TEST_FN[service]()
			if (result.connected) {
				setTestStatus("success")
			} else {
				setFailMessage(result.reason ? REASON_MESSAGE[result.reason] : undefined)
				setTestStatus("failed")
			}
		} catch {
			setTestStatus("failed")
		}
	}

	return {testStatus, failMessage, handleTest}
}

export default useConnectionTest
