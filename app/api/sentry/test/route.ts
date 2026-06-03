import { NextResponse } from "next/server"

const SENTRY_HOST = "https://sentry.io"

// app/ 레이어에서 features/ 타입을 직접 참조하지 않기 위해 로컬 정의
interface SentryConnectionTestResponse {
	connected: boolean
	reason?: "env_missing" | "invalid_token" | "api_error"
}

export const GET = async (): Promise<NextResponse<SentryConnectionTestResponse>> => {
	const token = process.env.NEXT_SENTRY_API_TOKEN

	if (!token) {
		return NextResponse.json({ connected: false, reason: "env_missing" })
	}

	try {
		const response = await fetch(`${SENTRY_HOST}/api/0/organizations/`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
			signal: AbortSignal.timeout(10000),
		})

		if (response.status === 401) {
			return NextResponse.json({ connected: false, reason: "invalid_token" })
		}

		if (!response.ok) {
			return NextResponse.json({ connected: false, reason: "api_error" })
		}

		return NextResponse.json({ connected: true })
	} catch (err) {
		console.error("Sentry connection error:", err)
		return NextResponse.json({ connected: false, reason: "api_error" })
	}
}
