import { apiClient } from "@/shared/api/client"
import type { ConnectionTestResult } from "@/features/settings/model/integrationTypes"

export const testPosthogConnection = async (): Promise<ConnectionTestResult> => {
	const response = await apiClient("/api/posthog/test")
	return response.json()
}
