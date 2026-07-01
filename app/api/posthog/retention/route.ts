import { NextResponse } from "next/server"
import { getRetentionServer } from "@/entities/event/api/getRetentionServer"

export async function GET(): Promise<NextResponse> {
	try {
		const data = await getRetentionServer()
		return NextResponse.json(data)
	} catch (error) {
		console.error("Retention API error:", error)
		return NextResponse.json(
			{ error: "리텐션 데이터를 불러오는 데 실패했습니다" },
			{ status: 500 },
		)
	}
}
