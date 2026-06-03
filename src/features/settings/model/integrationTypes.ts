export type ServiceType = "sentry" | "posthog"

export type ConnectionTestReason = "env_missing" | "invalid_token" | "api_error"

export interface ConnectionTestResult {
	connected: boolean
	reason?: ConnectionTestReason
}

export type TestStatus = "idle" | "loading" | "success" | "failed"
