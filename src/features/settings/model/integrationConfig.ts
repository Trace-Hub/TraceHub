import {testSentryConnection} from "@/features/settings/api/testSentryConnection"
import {testPosthogConnection} from "@/features/settings/api/testPosthogConnection"
import type {ConnectionTestReason} from "@/features/settings/model/integrationTypes"

export const SERVICE_CONFIG = {
    sentry: {
        title: "Sentry",
        envKeys: [
            "NEXT_SENTRY_API_TOKEN",
            "NEXT_SENTRY_ORG",
            "NEXT_SENTRY_PROJECT",
        ],
        guide: {
            NEXT_SENTRY_API_TOKEN: "1. Sentry 프로젝트 페이지에 들어갑니다.\n " +
                "2. Settings → Developer Tokens → Personal Tokens로 들어갑니다.\n " +
                "3. Create New Token → event, org 등 상황에 맞게 read로 설정합니다.\n " +
                "4. Create Token을 누른 뒤, 생성된 키 값을 확인합니다.",
            NEXT_SENTRY_ORG: "1. Sentry 프로젝트 페이지에 들어갑니다.\n " +
                "2. Settings → Organization Settings에서 Organization Slug를 확인합니다.",
            NEXT_SENTRY_PROJECT: "1. Sentry 프로젝트 페이지에 들어갑니다.\n " +
                "2. Settings → Projects → 생성한 프로젝트에 들어가 Project Slug를 확인합니다.",
        },
        docsUrl: "https://docs.sentry.io/account/auth-tokens/",
    },
    posthog: {
        title: "PostHog",
        envKeys: [
            "NEXT_PUBLIC_POSTHOG_HOST",
            "NEXT_PUBLIC_POSTHOG_APP_HOST",
            "NEXT_POSTHOG_PERSONAL_API_KEY",
            "NEXT_PUBLIC_POSTHOG_PROJECT_ID",
        ],
        guide: {
            NEXT_PUBLIC_POSTHOG_HOST: "PostHog 프로젝트 생성 시, 설정했던 지역에 맞게 주소를 입력합니다.\n " +
                "* US Cloud - Public endpoint: https://us.i.posthog.com\n" +
                "* EU Cloud - Public endpoint: https://eu.i.posthog.com",
            NEXT_PUBLIC_POSTHOG_APP_HOST: "PostHog 프로젝트 생성 시, 설정했던 지역에 맞게 주소를 입력합니다. (US Cloud\n" +
                "* US Cloud - Private endpoint: https://us.posthog.com\n" +
                "* EU Cloud - Private endpoint: https://eu.posthog.com",
            NEXT_POSTHOG_PERSONAL_API_KEY: "1. PostHog 프로젝트 페이지에 들어갑니다.\n " +
                "2. Settings → Account → Personal API Keys → Create personal API Key를 누릅니다.\n " +
                "3. 생성 후 키 값을 확인합니다. (이후 재확인 불가)",
            NEXT_PUBLIC_POSTHOG_PROJECT_ID: "1. PostHog 프로젝트 페이지에 들어갑니다.\n " +
                "2. Settings - General에서 Project ID를 확인합니다.",
        },
        docsUrl: "https://posthog.com/docs/api/personal-api-keys",
    },
} as const

export const TEST_FN = {
    sentry: testSentryConnection,
    posthog: testPosthogConnection,
} as const

export const REASON_MESSAGE: Record<ConnectionTestReason, string> = {
    env_missing: "환경변수가 설정되지 않았습니다",
    invalid_token: "토큰이 유효하지 않습니다",
    api_error: "API 연결에 실패했습니다",
}
