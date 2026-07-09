import { NextResponse } from "next/server";
import { getSentryConfig, sentryFetch } from "@/shared/api/sentryClient";

interface SentryConnectionTestResponse {
  connected: boolean;
  reason?: "env_missing" | "invalid_token" | "api_error";
}

export const GET = async (): Promise<
  NextResponse<SentryConnectionTestResponse>
> => {
  const config = getSentryConfig();

  if (!config) {
    return NextResponse.json({ connected: false, reason: "env_missing" });
  }

  try {
    const response = await sentryFetch("/api/0/organizations/", config);

    if (response.status === 401) {
      return NextResponse.json({ connected: false, reason: "invalid_token" });
    }

    if (!response.ok) {
      return NextResponse.json({ connected: false, reason: "api_error" });
    }

    return NextResponse.json({ connected: true });
  } catch (err) {
    console.error("Sentry connection error:", err);
    return NextResponse.json({ connected: false, reason: "api_error" });
  }
};
