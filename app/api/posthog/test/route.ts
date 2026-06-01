import { NextResponse } from "next/server"

interface PosthogConnectionTestResponse {
	connected: boolean
	reason?: "env_missing" | "invalid_token" | "api_error"
}

export const GET = async (): Promise<NextResponse<PosthogConnectionTestResponse>> => {
	const host = process.env.NEXT_PUBLIC_POSTHOG_HOST
	const apiKey = process.env.NEXT_POSTHOG_PERSONAL_API_KEY

	if (!host || !apiKey) {
		return NextResponse.json({ connected: false, reason: "env_missing" })
	}

	try {
		const response = await fetch(`${host}/api/users/@me/`, {
			headers: {
				Authorization: `Bearer ${apiKey}`,
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
