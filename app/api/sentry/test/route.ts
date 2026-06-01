import { NextResponse } from "next/server"

const SENTRY_HOST = "https://sentry.io"

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
		})

		if (response.status === 401) {
			return NextResponse.json({ connected: false, reason: "invalid_token" })
		}

		if (!response.ok) {
			return NextResponse.json({ connected: false, reason: "api_error" })
		}

		return NextResponse.json({ connected: true })
	} catch {
		return NextResponse.json({ connected: false, reason: "api_error" })
	}
}
