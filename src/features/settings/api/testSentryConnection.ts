import { apiClient } from "@/shared/api/client"
import type { ConnectionTestResult } from "@/features/settings/model/integrationTypes"

export const testSentryConnection = async (): Promise<ConnectionTestResult> => {
	const response = await apiClient("/api/sentry/test")
	return response.json()
}
