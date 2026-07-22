# PostHog 연동 가이드

TraceHub의 이벤트 대시보드는 PostHog를 데이터 소스로 사용합니다.
이 문서는 PostHog 프로젝트 준비부터 환경변수 설정, 대시보드 사용법, 커스터마이징 방법까지
TraceHub를 배포해서 사용하는 데 필요한 전체 과정을 안내합니다.

**목차**

- [🚀 빠른 시작 체크리스트](#-빠른-시작-체크리스트)
- [1. 동작 구조 개요](#1-동작-구조-개요)
- [2. PostHog 프로젝트 준비 & 환경변수 설정](#2-posthog-프로젝트-준비--환경변수-설정)
- [3. 연결 확인](#3-연결-확인)
- [4. 이벤트 수집 구조](#4-이벤트-수집-구조)
- [5. 대시보드 기능별 사용법](#5-대시보드-기능별-사용법)
- [6. 배포 후 반드시 커스터마이징할 파일](#6-배포-후-반드시-커스터마이징할-파일)
- [7. 제약 사항 및 알아둘 점](#7-제약-사항-및-알아둘-점)
- [8. 트러블슈팅](#8-트러블슈팅)
- [9. 라이브러리 전환 시 변경 예정 사항](#9-라이브러리-전환-시-변경-예정-사항)
- [부록. 용어 정리](#부록-용어-정리)

---

## 🚀 빠른 시작 체크리스트

처음 도입한다면 아래 순서대로 진행하세요. PostHog 계정 발급부터 첫 데이터 확인까지 10~15분이면 충분합니다.

1. **준비물 확인** — Node.js, pnpm, PostHog 계정 (무료 플랜으로 시작 가능)
2. **프로젝트 실행 준비**

   ```bash
   git clone <저장소 URL>
   cd TraceHub
   pnpm install
   ```

3. **PostHog 키 발급 & 환경변수 설정** — 2장을 따라 `.env.local`에 4개 필수 변수 입력
4. **개발 서버 실행 & 연결 확인** — `pnpm dev` 실행 후 `/dashboard/settings`에서 연결 테스트 (3장)
5. **첫 이벤트 보내기** — 서비스 화면을 돌아다니거나 버튼을 클릭해 페이지뷰/커스텀 이벤트를 발생시킵니다
6. **대시보드에서 확인** — `/dashboard/events`에서 수치 확인.
   이벤트가 PostHog에 집계되기까지 **수 초~수 분** 걸릴 수 있으니 바로 안 보여도 기다려 보세요.
7. **내 서비스에 맞게 수정** — 분석 대상 경로 추가(6-1), 필요한 커스텀 이벤트 추가(4-4)

각 단계에서 막히면 [8. 트러블슈팅](#8-트러블슈팅)을 참고하세요.

---

## 1. 동작 구조 개요

TraceHub는 PostHog와 두 방향으로 통신합니다.

| 방향                | 위치                     | 방식                                                                        |
|-------------------|------------------------|---------------------------------------------------------------------------|
| **수집 (이벤트 전송)**   | 브라우저 (클라이언트)           | `posthog-js` SDK가 페이지뷰·클릭 등 이벤트를 PostHog로 전송                              |
| **조회 (대시보드 데이터)** | Next.js 서버 (API Route) | HogQL Query API(`POST {HOST}/api/projects/{PROJECT_ID}/query`)로 집계 데이터 조회 |

- 수집: `instrumentation-client.ts`에서 `posthog.init()`이 앱 부팅 시 1회 실행되고,
  `src/app-init/PageviewTracker.tsx`가 SPA 라우트 변경마다 `$pageview`를 수동 캡처합니다.
- 조회: 모든 대시보드 분석 쿼리는 `src/shared/lib/posthogServer.ts`의 `runHogQLQuery()` 하나를 통해 실행됩니다.
  이 함수는 서버 전용 Personal API Key를 사용하므로 브라우저에 키가 노출되지 않습니다.

> **구분해야 할 핵심:** `NEXT_PUBLIC_POSTHOG_TOKEN`은 TraceHub 코드 자체가 이벤트를 PostHog로 **전송**할 때만 쓰이는 값이고,
> 나머지 4개(`NEXT_PUBLIC_POSTHOG_HOST`, `NEXT_PUBLIC_POSTHOG_APP_HOST`, `NEXT_PUBLIC_POSTHOG_PROJECT_ID`, `NEXT_POSTHOG_PERSONAL_API_KEY`)는
> TraceHub가 PostHog 데이터를 **조회**해 대시보드에 표시하는 데 쓰이는 값입니다.
> 분석 대상 서비스가 이미 별도로 PostHog 이벤트를 전송하고 있다면 `NEXT_PUBLIC_POSTHOG_TOKEN`은 필요 없고, 설정 화면(`/dashboard/settings`)에도 노출되지 않습니다 (2-3 참고).

---

## 2. PostHog 프로젝트 준비 & 환경변수 설정

### 2-1. PostHog 프로젝트 만들기

1. [PostHog Cloud](https://posthog.com)에 가입합니다. 무료 플랜은 신용카드 없이 시작할 수 있습니다.
2. 가입 과정에서 **데이터 저장 리전(US/EU)** 을 선택합니다.
   이 선택에 따라 아래 2-2의 호스트 주소가 달라지므로 어느 쪽을 골랐는지 기억해 두세요.
3. 온보딩을 마치면 프로젝트가 생성됩니다. 온보딩 중 SDK 설치 안내는 건너뛰어도 됩니다 —
   TraceHub에 이미 `posthog-js` 연동 코드가 들어 있어서 환경변수만 넣으면 동작합니다.

### 2-2. 환경변수 4종 (필수 — 조회/연결 테스트용)

프로젝트 루트에 `.env.local` 파일을 만들고(없다면 새로 생성) 아래 4개 변수를 설정합니다.
`.env.local`은 `.gitignore`에 포함되어 있어 저장소에 커밋되지 않으므로 키를 넣어도 안전합니다.

```bash
# .env.local (값은 본인 프로젝트의 것으로 교체)
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
NEXT_PUBLIC_POSTHOG_APP_HOST=https://us.posthog.com
NEXT_PUBLIC_POSTHOG_PROJECT_ID=12345
NEXT_POSTHOG_PERSONAL_API_KEY=phx_xxxxxxxx
```

| 변수                               | 용도                             | 발급/확인 위치                                                         | 노출 범위           |
|----------------------------------|--------------------------------|------------------------------------------------------------------|-----------------|
| `NEXT_PUBLIC_POSTHOG_HOST`       | 수집/API 호스트                     | US: `https://us.i.posthog.com` / EU: `https://eu.i.posthog.com`  | 클라이언트           |
| `NEXT_PUBLIC_POSTHOG_APP_HOST`   | PostHog 웹 UI 딥링크(원본 이벤트 바로가기)용 | US: `https://us.posthog.com` / EU: `https://eu.posthog.com`      | 클라이언트           |
| `NEXT_PUBLIC_POSTHOG_PROJECT_ID` | HogQL 조회 URL의 프로젝트 ID          | Settings → General → Project ID                                  | 클라이언트           |
| `NEXT_POSTHOG_PERSONAL_API_KEY`  | HogQL 조회 인증용 Personal API Key  | Settings → Account → Personal API Keys → Create personal API Key | **서버 전용**       |

> **⚠️ Personal API Key 주의사항**
> - 생성 직후 한 번만 표시되며 이후 재확인이 불가하므로 즉시 복사해 두세요.
> - 이 키는 프로젝트 데이터 조회 권한을 가지므로 **절대 `NEXT_PUBLIC_` 접두사를 붙이면 안 됩니다.**
    > `NEXT_PUBLIC_`이 없는 변수는 Next.js가 클라이언트 번들에 포함하지 않아 브라우저에 노출되지 않습니다.
> - 참고: [PostHog Personal API Keys 문서](https://posthog.com/docs/api/personal-api-keys)

`NEXT_PUBLIC_POSTHOG_APP_HOST`와 `NEXT_PUBLIC_POSTHOG_PROJECT_ID`가 없어도 대시보드 자체는 동작하지만,
이벤트 카드에서 PostHog 원본 데이터로 이동하는 딥링크가 비활성화됩니다.

환경변수를 추가·변경한 뒤에는 **개발 서버를 재시작해야** 반영됩니다.
특히 `NEXT_PUBLIC_` 변수는 빌드 시점에 번들에 포함되므로, 배포 환경에서는 재배포가 필요합니다.

### 2-3. (선택) TraceHub 코드로 이벤트 전송하기 — `NEXT_PUBLIC_POSTHOG_TOKEN`

`NEXT_PUBLIC_POSTHOG_TOKEN`은 위 4종과 성격이 다릅니다. TraceHub가 PostHog 데이터를 **조회**하는 데 쓰이는 값이 아니라,
`instrumentation-client.ts`의 `posthog.init()`이 이벤트를 PostHog로 **전송**할 때만 쓰입니다.
그래서 설정 화면(`/dashboard/settings`)의 연결 테스트 대상에도 포함되지 않으며, 안내 가이드에도 노출되지 않습니다.

- 분석 대상 서비스가 이미 자체적으로 PostHog SDK를 붙여 이벤트를 전송하고 있다면 이 값은 필요 없습니다.
- 지금 클론한 TraceHub 코드 자체에서 이벤트를 발생시키고 싶다면(예: 로컬에서 대시보드 동작을 확인해보고 싶을 때),
  아래처럼 본인 `.env.local`에 직접 추가하면 됩니다.

```bash
# .env.local (선택 — TraceHub 코드 자체에서 이벤트를 보내고 싶을 때만)
NEXT_PUBLIC_POSTHOG_TOKEN=phc_xxxxxxxx
```

발급 위치는 PostHog 프로젝트의 **Settings → General → Project token**입니다. 공개되어도 무방한 클라이언트 값입니다.

---

## 3. 연결 확인

환경변수 설정 후 개발 서버(또는 배포 환경)에서 **설정 페이지(`/dashboard/settings`)** 에 접속하면
PostHog 연결 테스트를 실행할 수 있습니다. 내부적으로 `GET /api/posthog/test`가
Personal API Key로 PostHog `/api/users/@me/`를 호출해 인증을 검증합니다.

실패 시 사유별 조치:

| 사유              | 메시지              | 조치                                                                            |
|-----------------|------------------|-------------------------------------------------------------------------------|
| `env_missing`   | 환경변수가 설정되지 않았습니다 | `NEXT_PUBLIC_POSTHOG_HOST`, `NEXT_POSTHOG_PERSONAL_API_KEY` 설정 여부 확인 후 서버 재시작 |
| `invalid_token` | 토큰이 유효하지 않습니다    | Personal API Key 재발급 (만료·오타·권한 부족 여부 확인)                                      |
| `api_error`     | API 연결에 실패했습니다   | 호스트 주소가 리전(US/EU)과 일치하는지, 네트워크 방화벽 여부 확인                                      |

---

## 4. 이벤트 수집 구조

### 4-1. 자동으로 수집되는 것

- `posthog.init()`은 `defaults: "2026-01-30"` 프리셋을 사용합니다.
  해당 시점의 PostHog 권장 기본값(자동 캡처, 세션·브라우저 프로퍼티 부착 등)이 적용됩니다.
- 페이지뷰(`$pageview`)는 SPA 라우트 변경을 정확히 잡기 위해
  `PageviewTracker`가 라우트 변경마다 수동으로 캡처합니다.

### 4-2. 커스텀 이벤트 5종

TraceHub가 기본 정의한 커스텀 이벤트입니다. (`src/shared/config/tracking.ts`)

| 상수               | 이벤트명             | 대시보드 표시 라벨 | 주요 프로퍼티 예시                |
|------------------|------------------|------------|---------------------------|
| `BUTTON_CLICKED` | `button_clicked` | 버튼 클릭      | `label`, `source`         |
| `LINK_CLICKED`   | `link_clicked`   | 링크 클릭      | `href`, `source`          |
| `FORM_SUBMITTED` | `form_submitted` | 폼 제출       | `name`, `source`          |
| `TAB_CHANGED`    | `tab_changed`    | 탭 전환       | `tab`, `source`           |
| `INPUT_FOCUSED`  | `input_focus`    | 입력 포커스     | `field`, `source`         |

> **⚠️ 프로퍼티에 개인정보 포함 주의**
> 이메일 등 원본 개인정보는 이벤트 프로퍼티로 그대로 전송하지 마세요.
> 꼭 필요하다면 별도의 동의 절차, 보존 기간, 접근 권한 정책을 먼저 마련한 뒤 추가하세요.

PostHog 빌트인 이벤트(`$pageview`, `$pageleave`, `$autocapture`, `$identify`, `$rageclick`)도
대시보드에서 한글 라벨로 표시됩니다. (`src/shared/config/eventLabel.ts`)

서비스 화면에서 버튼 클릭·폼 제출 등을 직접 수행해 이벤트가 정상 수집되는지 확인할 수 있습니다.

### 4-3. trackEvent() 사용법 — 이미 정의된 이벤트 보내기

이벤트 전송은 항상 `src/shared/lib/posthog.ts`의 `trackEvent()` 래퍼를 통해서만 합니다.
(`posthog.capture()`를 컴포넌트에서 직접 호출하는 것은 프로젝트 규칙상 금지)

``` typescript
trackEvent(event: keyof typeof TRACKING_EVENT, properties?: Record<string, unknown>): void
```

- 첫 번째 인자: `TRACKING_EVENT` 상수의 **키** (`"BUTTON_CLICKED"` 등). 문자열 이벤트명이 아닙니다.
- 두 번째 인자(선택): 이벤트와 함께 저장할 프로퍼티 객체. 대시보드/PostHog에서 필터·분석에 사용됩니다.

이미 정의된 5종 이벤트는 별도 등록 없이 바로 사용할 수 있습니다.

``` tsx
"use client";

import { trackEvent } from "@/shared/lib/posthog";

const DownloadButton = () => {
    const handleClick = (): void => {
        trackEvent("BUTTON_CLICKED", {
            label: "리포트 다운로드",   // 어떤 버튼인지 구분
            source: "report-page",     // 이벤트 발생 위치 구분
        });
        // ...실제 다운로드 로직
    };

    return (
        <button type="button" onClick={handleClick}>
            리포트 다운로드
        </button>
    );
};

export default DownloadButton;
```

`trackEvent`의 첫 인자는 `TRACKING_EVENT`의 키만 허용되므로,
상수에 없는 이벤트명을 넘기면 타입 에러로 걸러집니다.
전송된 이벤트는 잠시 후 `/dashboard/events/trends`와 PostHog Activity 화면에서 확인할 수 있습니다.

### 4-4. 새 커스텀 이벤트 추가하기

5종에 없는 새 이벤트가 필요하면 아래 3단계로 등록합니다.
"회원가입 완료" 이벤트를 추가하는 예시입니다.

1. **이벤트 상수 추가** — `src/shared/config/tracking.ts`

   ```typescript
   const TRACKING_EVENT = {
       // ...기존 이벤트
       SIGNUP_COMPLETED: "signup_completed",
   } as const;
   ```

   키는 UPPER_SNAKE_CASE, 이벤트명(값)은 snake_case로 작성합니다.

2. **표시 라벨 추가** — `src/shared/config/eventLabel.ts`

   ```typescript
   const EVENT_LABEL: Record<string, string> = {
       // ...기존 라벨
       "signup_completed": "가입 완료",
   }
   ```

   라벨을 등록하지 않아도 동작은 하지만, 대시보드에 원본 이벤트명(`signup_completed`)이 그대로 노출됩니다.

3. **컴포넌트에서 호출** — 4-3과 동일하게 `trackEvent()` 사용

   ```tsx
   "use client";

   import { trackEvent } from "@/shared/lib/posthog";

   const SignupForm = () => {
       const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
           e.preventDefault();
           // ...가입 처리 로직
           trackEvent("SIGNUP_COMPLETED", { plan: "free" });
       };

       return <form onSubmit={handleSubmit}>{/* ... */}</form>;
   };

   export default SignupForm;
   ```

등록한 이벤트는 자동으로 트렌드·이벤트 상세 화면에 집계되며,
퍼널 단계로 쓰려면 `funnelConfig.ts`에 추가하면 됩니다 (6-2 참고).

---

## 5. 대시보드 기능별 사용법

이벤트 대시보드는 `/dashboard/events` 하위에 있습니다.
각 화면이 동작하려면 표의 "필요한 데이터"가 PostHog에 쌓여 있어야 합니다.

| 메뉴             | 경로                              | 보여주는 것                                   | 필요한 데이터                                                                     |
|----------------|---------------------------------|------------------------------------------|-----------------------------------------------------------------------------|
| 이벤트 개요 / KPI   | `/dashboard/events`             | 오늘·최근 7일 활성 사용자, 총 이벤트 수, 시간대별 추이        | 아무 이벤트나 (사용자 수는 `person_id` 기준)                                             |
| 트렌드            | `/dashboard/events/trends`      | 이벤트별 발생량 목록·시계열, 기간/경로/카테고리 필터           | 이벤트 + `$pathname`                                                           |
| 이벤트 상세         | `/dashboard/events/[eventName]` | 특정 이벤트의 발생량, 고유 사용자·세션 수, 브라우저/OS/URL 분포 | `$session_id`, `$browser`, `$os`, `$current_url`, `$prev_pageview_pathname` |
| 퍼널             | `/dashboard/events/funnels`     | `funnelConfig.ts`에 정의한 단계별 전환율           | 퍼널에 지정한 이벤트들                                                                |
| 경로 분석 (Sankey) | `/dashboard/events/paths`       | 세션별 페이지 이동 흐름, 진입/이탈 페이지                 | **`$pageview` + `$session_id` + `$pathname` 필수**                            |
| 라이프사이클         | `/dashboard/events/lifecycle`   | 신규/복귀/휴면 사용자 분류 (최근 60~90일)              | 이벤트 + `person_id`                                                           |
| 리텐션            | `/dashboard/events/retention`   | 주 단위 코호트 리텐션 (최근 12주)                    | 이벤트 + `person_id`                                                           |

`$session_id`, `$pathname`, `$browser` 등의 프로퍼티는 `posthog-js`가 기본 설정에서 자동으로 부착하므로,
이 저장소의 수집 코드를 그대로 사용하면 별도 작업이 필요 없습니다.
단, 다른 방식(서버 사이드 캡처, 커스텀 SDK 설정 등)으로 이벤트를 보내는 경우
위 프로퍼티가 빠지면 해당 화면이 빈 상태로 표시됩니다.

---

## 6. 배포 후 반드시 커스터마이징할 파일

### 6-1. 분석 대상 경로 — `src/shared/config/trackedPaths.ts`

이벤트 대시보드는 이 목록에 포함된 경로의 이벤트만 집계합니다.
기본값은 `/`(홈)만 포함하며, 그 외에 연동해서 파악하고 싶은 경로가 있다면
이 배열에 경로를 추가하면 됩니다.

``` typescript
// 기본값
export const TRACKED_PATHS = ["/"] as const;

// 예시: 분석하고 싶은 경로 추가
export const TRACKED_PATHS = ["/", "/products/*", "/checkout", "/mypage/*"] as const;
```

매칭 규칙:

- 경로 그대로 (`"/checkout"`): 해당 경로만 정확히 일치
- `/*`로 끝나면 (`"/products/*"`): 해당 경로와 모든 하위 경로 포함 (`/products`, `/products/1`, ...)

### 6-2. 퍼널 정의 — `src/shared/config/funnelConfig.ts`

`FUNNEL_CONFIG` 배열에 퍼널을 추가하면 Funnels 대시보드의 선택 탭에 자동으로 나타납니다.

``` typescript
{
    id: "signup",                    // 영문 소문자·숫자·하이픈만 허용
    name: "회원가입 플로우",           // 탭에 표시될 이름
    steps: [                         // 2단계 이상 권장, PostHog 이벤트명 순서대로
        { event: "signup_started",   label: "가입 시작" },
        { event: "email_verified",   label: "이메일 인증" },
        { event: "signup_completed", label: "가입 완료" },
    ],
}
```

각 단계의 `event`는 실제로 수집되고 있는 PostHog 이벤트명이어야 합니다.
커스텀 이벤트라면 4-4의 절차로 먼저 수집을 추가하세요.

---

## 7. 제약 사항 및 알아둘 점

- **타임존은 KST(UTC+9) 고정입니다.** 일/주 경계가 한국 시간 기준으로 계산되므로
  (`src/shared/lib/posthogServer.ts`의 `KST_OFFSET`), 다른 타임존 사용자는 날짜 경계가 어긋날 수 있습니다.
- **기간 필터 기준**: `day` = 오늘(달력 기준), `week` = 최근 7일, `month` = 최근 30일.
  경로 분석(Paths)은 달력이 아닌 현재 시점 기준 롤링 윈도우(1/7/30일)를 사용합니다.
- **조회 한도**: 경로 분석·퍼널의 원본 이벤트 조회는 `LIMIT 50000` 행까지만 가져옵니다.
  트래픽이 많은 서비스에서는 오래된 기간의 수치가 일부 누락될 수 있습니다.
- **쿼리 타임아웃**: 기본 10초, 무거운 스캔 쿼리는 30초. 초과 시 해당 위젯이 에러 상태로 표시됩니다.
- **고유 사용자 집계 기준**: 화면에 따라 `person_id`(KPI·라이프사이클·리텐션) 또는
  `distinct_id`(이벤트 상세)를 사용하므로, 화면 간 사용자 수가 정확히 일치하지 않을 수 있습니다.
  경로 분석은 사용자가 아닌 **세션(`$session_id`) 단위**로 흐름을 그립니다.
- **PostHog 무료 플랜**은 월 이벤트 수 한도가 있으므로, 트래픽 규모에 따라 플랜을 확인하세요.

---

## 8. 트러블슈팅

대시보드에 데이터가 보이지 않을 때 아래 순서로 점검하세요.

1. **연결 테스트** — `/dashboard/settings`에서 PostHog 연결 테스트 실행 (3장 참고)
2. **환경변수 확인** — 4개 필수 변수가 모두 설정됐는지, 호스트가 리전과 일치하는지 확인.
   환경변수 변경 후에는 서버 재시작이 필요합니다.
   TraceHub 코드 자체에서 이벤트를 보내고 싶다면 `NEXT_PUBLIC_POSTHOG_TOKEN`도 설정했는지 확인하세요 (2-3 참고).
3. **수집 확인** — 서비스 화면에서 이벤트를 발생시킨 뒤,
   PostHog 웹 UI의 Activity 화면에서 이벤트가 실제로 들어오는지 확인합니다.
   (이벤트 카드의 딥링크를 쓰면 해당 이벤트의 원본 데이터로 바로 이동합니다.)
   전송부터 집계까지 수 초~수 분의 지연이 있을 수 있으니, 방금 보낸 이벤트가
   대시보드에 안 보이면 잠시 후 새로고침해 보세요.
   광고 차단기(uBlock 등)가 PostHog 요청을 막는 경우도 있으니
   시크릿 창이나 차단기 해제 상태에서도 확인해 보세요.
4. **경로 매칭 확인** — 이벤트가 PostHog에는 있는데 대시보드에 없다면,
   해당 페이지 경로가 `TRACKED_PATHS`에 포함돼 있는지 확인하세요 (6-1 참고).
5. **프로퍼티 확인** — 경로 분석·이벤트 상세가 비어 있다면 PostHog Activity에서
   이벤트에 `$pathname`, `$session_id` 프로퍼티가 붙어 있는지 확인하세요 (5장 표 참고).

---

## 9. 라이브러리 전환 시 변경 예정 사항

현재 TraceHub는 저장소를 클론·배포해서 사용하는 셀프호스트 Next.js 앱입니다.
추후 npm 라이브러리로 전환되면, 이 문서에서 "파일을 직접 수정"하는 부분
(`trackedPaths.ts`, `funnelConfig.ts`, `tracking.ts` 등)은 설치 시 옵션으로 주입하는 방식으로 바뀔 예정입니다.
환경변수 구성(2장)과 필요한 이벤트/프로퍼티 요구사항(5장)은 전환 후에도 동일하게 적용됩니다.

---

## 부록. 용어 정리

이벤트 분석 도구를 처음 사용한다면 아래 용어를 먼저 익혀두면 대시보드를 이해하기 쉽습니다.

| 용어                     | 설명                                                                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| 이벤트 (Event)           | 사용자 행동 하나하나의 기록. 페이지 방문, 버튼 클릭 등이 각각 이벤트 1건                                                             |
| 프로퍼티 (Property)      | 이벤트에 붙는 부가 정보. `$browser`처럼 `$`로 시작하면 PostHog가 자동으로 붙이는 시스템 프로퍼티, 나머지는 직접 넣는 커스텀 프로퍼티 |
| 세션 (Session)           | 한 사용자의 연속된 방문 단위. 잠시 쉬었다 다시 들어오면 새 세션이 됩니다. 경로 분석이 세션 단위로 흐름을 그림                        |
| `person_id`              | PostHog가 사람(person) 단위로 병합한 식별자. KPI·라이프사이클·리텐션처럼 **사람 단위 집계**에 사용 (7장 참고)                        |
| `distinct_id`            | 이벤트를 발생시킨 기기/세션에 붙는 원본 식별자. 이벤트 상세 화면처럼 **이벤트 단위 식별**에 사용 (7장 참고)                          |
| 퍼널 (Funnel)            | "방문 → 클릭 → 제출"처럼 여러 단계를 순서대로 통과한 비율(전환율)을 보는 분석                                                        |
| 리텐션 (Retention)       | 특정 주에 방문한 사용자가 이후 주에도 다시 방문하는 비율. 코호트(같은 주에 방문한 그룹) 단위로 표시                                  |
| 라이프사이클 (Lifecycle) | 사용자를 신규/복귀/재활성/휴면으로 분류해 사용자 구성의 변화를 보는 분석                                                             |
| HogQL                    | PostHog의 SQL 방언. TraceHub 서버가 대시보드 데이터를 조회할 때 내부적으로 사용 (직접 작성할 일은 없음)                            |
