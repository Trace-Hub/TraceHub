# AGENTS.md

> 이 문서는 AI Agent(Claude, Cursor, Kiro 등)가 이 프로젝트를 올바르게 이해하고,
> 일관된 방식으로 코드를 작성·수정·검토할 수 있도록 작성된 가이드입니다.
> 모든 Agent는 코드 작성 전 이 문서를 반드시 참고해야 합니다.

---

## 1. Project Overview

- **프로젝트 목적**: 에러 추적 & 사용자 이벤트 추적 모니터링하는 어드민용 대시보드
- **주요 기능**: 에러 추적, 사용자 행동 추적, 데이터 시각화
- **해결하려는 문제**: 페이지에 접근한 사용자의 행동을 파악해서, 이벤트 발생과 에러 발생을 추적하여 빠른 대응 가능하도록 함
- **주요 사용자**: 페이지 관리자, CTO

---

## 2. Tech Stack

| Category              | Technology               | Version  |
|-----------------------|--------------------------|----------|
| Framework             | Next.js                  | ^16.2.4  |
| Language              | TypeScript               | ^5       |
| CSS                   | Tailwind CSS             | ^4       |
| State Management      | Zustand                  | ^5.0.13  |
| State Management      | @tanstack/react-query    | ^5.100.9 |
| Animation             | Motion                   | ^12.38.0 |
| UI Library            | shadcn                   | ^4.7.0   |
| Package Manager       | pnpm                     | ^10.33.3 |
| Deployment            | Vercel                   | -        |
| Code Formatting       | ESLint                   | ^9       |
| Code Formatting       | @biomejs/biome           | 2.4.14   |
| Code Formatting       | lefthook                 | ^2.1.6   |
| Error Monitoring      | @sentry/nextjs           | ^10.51.0 |
| User Event Monitoring | posthog-js               | ^1.372.9 |
| Testing               | Jest                     | ^30.3.0  |
| Testing               | React Testing Library    | ^16.3.2  |
| Utility               | clsx                     | ^2.1.1   |
| Utility               | class-variance-authority | ^0.7.1   |
| Utility               | tailwind-merge           | ^3.5.0   |
| Management            | Github Projects          | -        |
| Management            | Github Issues            | -        |

---

## 3. Directory Structure

```
📁 app/
	├──  📁 app-init/                    # 엔트리포인트, Provider, 글로벌 설정
    │    └── providers.tsx
    │  
    │
    📁 process/                     # 유저 시나리오 / 크로스 피처 플로우
    │   └── [scenario-name]/        # 예: register-flow/, checkout-flow/
    │       ├── ui/
    │       └── model/
    │
    📁 pages/                       # 라우트 단위 페이지 조합
    │   └── [page-name]/            # 예: home/, profile/, product-detail/
    │       └── ui/                 # 페이지 컴포넌트 (레이아웃 조합)
    │
    📁 features/                    # 독립적 기능 단위
    │   └── [feature-name]/         # 예: auth/, search/, cart/
    │       ├── ui/                 # 기능 UI 컴포넌트
    │       ├── model/              # 상태, 스토어, 비즈니스 로직
    │       └── api/                # 해당 기능의 API 호출 함수
    │
    📁 entities/                    # 핵심 도메인 모델
    │   └── [entity-name]/          # 예: user/, product/, order/
    │       ├── ui/                 # 도메인 관련 UI (UserCard, ProductBadge 등)
    │       ├── model/              # 타입, 스키마, 도메인 유틸
    │       └── api/                # 엔티티 CRUD API
    │
    📁 shared/                      # 공용 리소스 (레이어 의존성 없음)
        ├── ui/                     # 공통 원자 컴포넌트 (Button, Input 등)
        ├── hooks/                  # 범용 커스텀 훅
        ├── api/                    # fetch 클라이언트 래퍼, 공통 설정
        ├── lib/                    # 외부 라이브러리 래퍼 (dayjs, i18n 등)
        ├── config/                 # 환경변수, 앱 설정 상수
        ├── types/                  # 전역 공통 타입
        └── styles/                 # 전역 스타일
```

> **같은 레이어 간 참조 금지**: `feature/auth`가 `feature/search`를 import하는 것은 금지입니다.
> 크로스 피쳐 의존이 필요한 경우, `process/` 레이어로 올린다.

### 파일 생성 위치 규칙

새 파일을 만들기 전에, 아래 기준으로 레이어를 먼저 결정합니다.

| 상황                                       | 위치                 |
|------------------------------------------|--------------------|
| 여러 feature에서 공통으로 사용하는 컴포넌트·훅·유틸         | `shared/`          |
| User, Product 등 도메인 모델, CRUD API, 도메인 UI | `entities/[name]/` |
| 로그인, 검색, 장바구니 등 독립 기능 단위                 | `features/[name]/` |
| 회원가입 플로우처럼 여러 feature를 엮는 시나리오           | `process/[name]/`  |
| 특정 라우트의 페이지 레이아웃 조합                      | `pages/[name]/`    |
| Provider, 글로벌 설정, 앱 진입점                  | `app-init/`        |

### 슬라이스 내부 구조 (파일명 = 함수명 규칙)

`index.ts` 배럴 파일을 사용하지 않습니다.

각 파일명은 해당 파일이 export하는 주요 함수/컴포넌트명과 동일하게 작성합니다.

import 시 파일 경로를 직접 명시합니다.

```
// ❌ Bad: index.ts 배럴 파일 사용
import { LoginForm } from "@/features/auth";

// ✅ Good: 파일명으로 직접 import (파일명 = 함수명)
import LoginForm from "@/features/auth/ui/LoginForm";
```

### 컴포넌트 / hooks / api / model 분리 기준

| 폴더       | 포함 내용                                |
|----------|--------------------------------------|
| `ui/`    | React 컴포넌트 (.tsx)                    |
| `model/` | Zustand 스토어, 비즈니스 로직, 도메인 타입, 유틸     |
| `api/`   | API 호출 함수, TanStack Query hooks      |
| `lib/`   | 외부 라이브러리 초기화·래핑 (`shared/lib/`에만 위치) |

---

## 4. Coding Rules

### TypeScript

- `any` 사용 **금지**, 불가피한 경우 `unknown` + 타입 가드 사용
- 모든 함수의 인자 및 반환값에 타입 명시
- `interface`는 객체 형태, `type`은 유니언/교차 타입에 사용
- `as` 타입 단언은 최소화, 사용 시 이유를 주석으로 명시

``` typescript
// ❌ Bad
const fetchUser = async (id: any) => { ...
}

// ✅ Good
const fetchUser = async (id: string): Promise<User> => { ...
}
```

### 컴포넌트 작성

- 컴포넌트는 화살표 함수 형태로 작성한다. (클래스형 **금지**)
- 컴포넌트 파일명: PascalCase (ex. `UserCard.tsx`)
- 파일 하나당 export는 원칙적으로 하나 (`export default`)
    - 예외: 관련 타입/상수를 named export로 함깨 보내는 경우

``` typescript
interface UserCardProps {
    userId: string
    name: string
}

const UserCard = ({userId, name}: UserCardProps) => {
...
}

export default UserCard
```

### 네이밍 규칙

| 대상        | 규칙               | 예시                 |
|-----------|------------------|--------------------|
| 컴포넌트      | PascalCase       | `UserProfile`      |
| 함수/변수     | camelCase        | `fetchUserData`    |
| 상수        | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT`  |
| 타입/인터페이스  | PascalCase       | `UserResponse`     |
| 커스텀 훅     | `use` 접두사        | `useAuthUser`      |
| 이벤트 핸들러   | `handle` 접두사     | `handleSubmit`     |
| API 조회 함수 | get 접두사          | `getArticleDetail` |
| API 생성 함수 | create 접두사       | `createArticle  `  |
| API 수정 함수 | update 접두사       | `updateArticle `   |
| API 삭제 함수 | delete 접두사       | `deleteArticle`    |
| 폴더명       | lowercase        | `utils`            |

### 기타

- `console.log` 커밋 금지 (디버깅 후 반드시 제거)
- 환경 변수 접근 : `process.env.NEXT_PUBLIC_XXX` 형태로 통일 (직접 하드코딩 금지)
- 주석은 **왜**를 설명. 무엇을 하는지는 코드로 표현

``` typescript
// ❌ Bad: 코드 그대로 반복
// user 데이터를 가져온다
const user = await fetchUser(id)

// ✅ Good: 이유 설명
// 토큰 만료 시 자동 갱신을 위해 별도 클라이언트로 분리
const user = await authClient.fetchUser(id)
```

---

## 5. UI Rules

### 공통 컴포넌트 우선

- 새 컴포넌트를 만들기 전에 `shared/ui/`에 유사 컴포넌트가 있는지 **반드시 확인**
- 공통 컴포넌트가 있으면 새로 만들지 않고 기존 것을 확장
- 도메인과 연관된 UI(UserCard, ProductBadge 등)는 `entities/[name]/ui/`에 위치

### 스타일 작성

- Tailwind 유틸리티 클래스 우선 사용
- 인라인 `style` 속성 사용 **지양**
- 반복되는 클래스 조합은 `cn()` 유틸 또는 컴포넌트 분리로 처리

### 반응형 기준

- 모바일 퍼스트로 작성

```
/* ─── breakpoint(mobile First) ─── */
    --breakpoint-sm: 640px;
    --breakpoint-md: 744px;
    --breakpoint-lg: 1280px;
```

### 접근성

- 인터랙티브 요소에 `aria-label` 또는 시맨틱 태그 사용
- 이미지에 `alt` 속성 필수
- 색상만으로 상태를 표현하지 않음 (아이콘 또는 텍스트 병행)

---

## 6. State Management Rules

### 서버 상태 vs 클라이언트 상태 구분

| 상태 종류               | 도구             | 예시                |
|---------------------|----------------|-------------------|
| 서버에서 오는 데이터         | TanStack Query | 유저 정보, 게시물 목록     |
| UI 상태 / 전역 클라이언트 상태 | Zustand        | 모달 open 여부, 선택된 탭 |
| 컴포넌트 로컬 상태          | useState       | 폼 입력값, 토글         |

### TanStack Query 사용 기준

- 서버 데이터를 `useState`에 직접 저장 **금지**
- Query Key는 계층 구조로 관리: `['users', userId, 'posts']`
- mutation 후 관련 쿼리는 `invalidateQueries`로 갱신

### SSR Prefetch + Hydration 패턴

- **SSR에서 데이터를 미리 패칭하고 CSR로 넘기는 방식을 기본 패턴으로 사용**
- Server Component에서 `prefetchQuery`로 데이터를 채운 뒤 `<HydrationBoundary>`로 전달
- Client Component에서는 `useQuery`로 동일한 Query Key를 사용하면 추가 요청 없이 캐시 사용
-

``` typescript
// pages/home/ui/HomePage.tsx (Server Component)
export default async function HomePage() {
    const queryClient = new QueryClient()

    await queryClient.prefetchQuery({
        queryKey: ['users'],
        queryFn: getUsers,
    })

    return (
        <HydrationBoundary state = {dehydrate(queryClient)} >
            <UserList / >
            </HydrationBoundary>
    )
}

// features/user/ui/UserList.tsx (Client Component)
export function UserList() {
    const {data} = useQuery({
        queryKey: ['users'], // 동일한 Key → SSR 캐시 재사용, 추가 요청 없음
        queryFn: getUsers,
    })
...
}
```

- `prefetchQuery`는 `pages/[name]/ui/` 또는 레이아웃 Server Component에서만 호출
- Client Component에서 직접 `prefetchQuery` 호출 **금지**

### Zustand 사용 기준

- 서버 상태를 Zustand에 캐싱 **금지** (TanStack Query와 역할 중복 방지)
- 스토어 파일은 해당 기능의 `features/[name]/model/` 또는 `entities/[name]/model/` 내에 위치
- 스토어는 기능 단위로 분리 (하나의 거대한 스토어 지양)

### Props Drilling 제한

- **3 depth 이상** props를 내려야 하는 경우 → Context API 또는 Zustand 사용
- 단, 단순 설정값(color, size 등)은 예외 허용

---

## 7. API Rules

### API 함수 위치

- API 호출 함수는 해당 리소스의 레이어 `api/` 폴더에 위치
    - 엔티티 CRUD → `entities/[name]/api/`
    - 기능 전용 API → `features/[name]/api/`
- fetch 클라이언트 공통 설정 → `shared/api/client.ts`
- 컴포넌트나 훅 내부에 직접 `fetch` 작성 **금지** (반드시 래퍼 함수 사용)

### 공통 설정

- Base URL, 공통 헤더(Content-Type 등)는 `shared/api/client.ts`에서 한 곳에 정의
- 인증 토큰 자동 주입, 401 시 갱신 처리는 fetch를 감싼 공통 래퍼 함수에서 처리
- 직접 `fetch()`를 호출하지 않고 반드시 이 래퍼를 통해 요청

```typescript
// shared/api/client.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL

export async function apiClient(path: string, options: RequestInit = {}): Promise<Response> {
    const token = getAccessToken()

    const response = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? {Authorization: `Bearer ${token}`} : {}),
            ...options.headers,
        },
    })

    // 401 시 토큰 갱신 후 재시도
    if (response.status === 401) {
        await refreshAccessToken()
        return apiClient(path, options)
    }

    return response
}
```

### PostHog 이벤트 트래킹 규칙

- 이벤트 트래킹 호출을 `ui/` 컴포넌트 내부에 직접 작성 **금지**
- PostHog 래퍼 함수는 `shared/lib/posthog.ts`에서 관리하고, 반드시 이 함수를 통해 호출
- 이벤트명은 `shared/config/tracking.ts`에 상수로 정의하고, 문자열 직접 입력 **금지**

```typescript
// shared/config/tracking.ts
export const TRACKING_EVENTS = {
    LOGIN_SUCCESS: 'login_success',
    SEARCH_EXECUTED: 'search_executed',
} as const

// shared/lib/posthog.ts
export const trackEvent = (event: keyof typeof TRACKING_EVENTS, properties?: Record<string, unknown>) => {
    posthog.capture(TRACKING_EVENTS[event], properties)
}

// ❌ Bad: 컴포넌트 내부에서 직접 호출
posthog.capture('login_success')

// ✅ Good: 래퍼 함수 사용
trackEvent('LOGIN_SUCCESS', {userId})
```

### 에러 처리

- API 에러는 함수 내에서 throw하고, 호출부(TanStack Query의 `onError` 등)에서 처리
- 사용자에게 노출할 메시지와 개발용 로그는 반드시 구분

### 응답 타입 정의

- 모든 API 응답에 TypeScript 타입 정의 필수
- 전역 공통 타입 → `shared/types/`
- 도메인 타입 → `entities/[name]/model/`
- 기능 전용 타입 → `features/[name]/model/`

```typescript
interface GetUserResponse {
    id: string
    name: string
    email: string
}

export const getUser = async (id: string): Promise<GetUserResponse> => {
    const response = await apiClient(`/users/${id}`)
    return response.json()
}
```

### Race Condition 방지

- 동시에 동일한 API를 여러 번 호출할 수 있는 상황(검색 자동완성, 탭 전환 등)에서는 반드시 `shared/utils/withAbort.ts` 유틸을 사용
- `AbortController`를 활용해 이전 요청을 취소하고 마지막 요청 결과만 사용
- `apiClient`는 `signal` 옵션을 지원하며, 유틸 함수에서 자동으로 주입
-

```typescript
// shared/utils/withAbort.ts
export function createAbortableRequest<T>(
    requestFn: (signal: AbortSignal) => Promise<T>
) {
    let controller: AbortController | null = null

    return () => {
        // 이전 요청이 진행 중이면 취소
        controller?.abort()
        controller = new AbortController()

        return requestFn(controller.signal)
    }
}

// 사용 예시 (features/search/api/searchProducts.ts)
const fetchSearchResults = createAbortableRequest((signal) =>
    apiClient('/products/search', {signal}).then(res => res.json())
)

// 키 입력마다 호출해도 마지막 요청 결과만 반영됨
const results = await fetchSearchResults()
```

- TanStack Query를 함께 사용하는 경우, `queryFn` 내부에서 `signal`을 활용
-

```typescript
useQuery({
    queryKey: ['search', keyword],
    queryFn: ({signal}) =>
        apiClient(`/products/search?q=${keyword}`, {signal}).then(res => res.json()),
})
// TanStack Query가 자동으로 이전 쿼리를 abort 처리함
```

### 낙관적 업데이트

- 낙관적 업데이트(optimistic update)는 **명시적으로 요청된 경우에만** 적용
- 임의 적용 시 실패 복구 로직까지 반드시 함께 작성

---

## 8. Error Handling Rules

### 전역 에러 처리

- React Error Boundary를 최상단에 배치하여 렌더링 에러 처리
- TanStack Query의 전역 `onError` 콜백으로 API 에러 공통 처리

### 사용자 피드백 방식

- 성공/실패 피드백: Toast 알림
- 폼 유효성 에러: 인풋 하단 인라인 메시지
- 페이지 수준 에러: Error Boundary → 에러 페이지 렌더링

### 에러 메시지 노출 기준

| 상황                | 표시 내용                                   |
|-------------------|-----------------------------------------|
| 사용자 실수 (유효성 오류 등) | 원인과 해결 방법을 안내하는 친절한 메시지                 |
| 서버/네트워크 오류        | "잠시 후 다시 시도해주세요" 수준의 일반 메시지             |
| 개발 디버깅            | `console.error`로 원본 에러만 기록 (프로덕션 노출 금지) |

### 에러 로깅

- Sentry 사용. 설정 위치: `shared/lib/sentry.ts`
- 캡처 대상: API 에러, Error Boundary catch, 예상치 못한 예외
- 개발 환경에서는 비활성화, 프로덕션에서만 활성화

---

## 9. Testing Rules

### 테스트 대상

- 비즈니스 로직이 있는 유틸 함수 (`utils/`)
- 커스텀 훅의 상태 변화
- 공통 UI 컴포넌트의 핵심 인터랙션 (클릭, 폼 제출 등)
- API 에러 처리 분기

### 파일 위치

- 테스트 파일은 대상 파일과 같은 폴더에 위치: `UserCard.test.tsx`

### Mock 사용 기준

- 외부 API 호출은 반드시 mock 처리
- 모듈 전체를 mock하기보다 최소 단위로 mock
- API mock은 `jest.fn()`으로 처리한다. (MSW 미사용)

### 필수 테스트 원칙

> "어떤 케이스"를 테스트할지보다 **"왜 이 로직이 테스트되어야 하는가"** 를 기준으로 판단

- 엣지 케이스(빈 값, 최댓값, 잘못된 타입 등)는 반드시 포함
- 성공 케이스뿐 아니라 **에러 케이스도 동등하게 작성**

---

## 10. Git Rules

> AI Agent가 직접 커밋·PR을 생성하는 경우 아래 규칙을 따른다.

### 브랜치 네이밍

```
// format
#{이슈번호}-{기능종류}-{작업설명}

// example
#1-feat-login
#23-feat-ui
#25-chore-dependency
```

- 기능종류

| 접두사           | 의미                     |
|---------------|------------------------|
| `feat`        | 새로운 기능 추가(feature의 준말) |
| `fix`         | 버그 수정                  |
| `refactor`    | 코드 리팩토링                |
| `chore`       | 빌드 관련 수정, 패키지 매니저 설정 등 |
| `test`        | 테스트 코드 추가/수정           |
| `docs`        | 문서 수정                  |
| `improvement` | 기존 기능 개선               |
| `config/`     | 환경 설정                  |

### 커밋 메시지

```
<타입>(<범위>): <제목> (제목은 40자 이내)

<본문> (선택 사항, 한 줄 띄우고 작성. 72자 이내로 줄 바꿈)

Resolves: #<이슈번호>
See also: None (기본값은 None이며, 관련 항목이 있으면 #<이슈번호>로 기입)

; ---
; 타입 목록:
;   feat:     새로운 기능 추가
;   fix:      버그 수정
;   docs:     문서 수정
;   style:    코드 포맷팅, 세미콜론 누락, 코드 변경 없는 경우
;   refactor: 코드 리팩토링
;   test:     테스트 코드 추가/수정
;   chore:    빌드 관련 수정, 패키지 매니저 설정 등
; ---
;
; ---
; 범위 목록:
;   common:
;     config: 환경 구성
;     domain: 도메인 영역
;       admin: 관리자 영역
;       user: 사용자 영역
;       product: 상품 영역
;   docs:
;     api: REST API 문서
;     wiki: Wiki 문서
; ---
;
; Resolves: 해결한 이슈 번호
; See also: 관련된 이슈 번호
```

### PR 작성 기준

- 변경 목적과 범위를 명확히 작성
- 관련 이슈 번호 링크
- 스크린샷 또는 테스트 결과 첨부 (UI 변경 시)

---

## 11. Formatter & Linter Rules

- **Biome을 우선 기준으로 사용** (포매팅 + 린팅 모두 Biome으로 처리)
- ESLint는 Biome이 커버하지 못하는 **React Hooks 규칙(`eslint-plugin-react-hooks`)에 한해서만** 사용
- 두 도구의 규칙이 충돌하는 경우 **Biome을 우선** 적용
- 커밋 전 Lefthook이 자동으로 Biome 검사를 실행하므로, 경고를 무시하고 커밋 **금지**
- `biome.json`이 기준 설정 파일이며, 임의로 규칙을 끄거나 수정하지 않는다
    - 규칙 변경이 필요한 경우 팀 리뷰 후 반영

### Never

- Biome 경고를 `// biome-ignore` 주석으로 임의 무시
- `.eslintrc`와 `biome.json` 규칙을 동시에 수정해 충돌 유발

## 12. AI Agent Rules

### 코드 작성 원칙

- **기존 코드 스타일을 최우선으로 따른다.** 같은 기능이라도 프로젝트 패턴에 맞는 방식으로 작성
- **변경 범위를 최소화한다.** 요청된 기능 외 코드는 손대지 않는다
- **요청하지 않은 리팩터링은 하지 않는다.** 개선이 필요해 보여도 별도로 제안만 한다
- **임의로 라이브러리를 추가하지 않는다.** 필요 시 반드시 먼저 확인 요청
- **타입 에러를 무시하지 않는다.** `any`나 `as`로 억지로 통과시키지 않는다
- **테스트 가능한 구조로 작성한다.** 사이드이펙트와 순수 로직을 분리

### 파일·컴포넌트 탐색 우선

- 새 파일을 만들기 전에 **기존 유사 파일을 먼저 탐색**한다
- 공통 컴포넌트는 `shared/ui/`, 도메인 UI는 `entities/[name]/ui/`를 먼저 확인한다
- API 함수를 작성하기 전에 `entities/[name]/api/` 또는 `features/[name]/api/`에 동일한 함수가 있는지 확인한다
- 같은 레이어 간 참조가 필요한 경우 `process/` 레이어로 올릴 것을 먼저 검토한다

### 환경변수 및 민감 정보

- 환경변수가 필요한 경우 `.env.example`에 **키만 추가**하고 값은 절대 채우지 않는다
- API 키, 비밀번호 등 민감 정보를 코드에 하드코딩하지 않는다

### 삭제 및 수정 시 주의

- 파일·함수·변수 삭제 전 **사용처(import, 참조)를 반드시 확인**한다
- 타입 변경 시 해당 타입을 사용하는 모든 파일에 영향이 없는지 확인한다

### 불확실한 경우

- 요구사항이 불명확하면 **임의로 해석하지 않고** 주석이나 `TODO`로 남긴다
- 선택지가 여럿일 때는 각 옵션의 트레이드오프를 주석으로 명시한다

```typescript
// TODO: 페이지네이션 방식이 결정되지 않음 (cursor 방식 vs offset 방식)
// cursor: 실시간 데이터에 적합, offset: 페이지 이동에 적합
```

### Never (절대 하지 않는 것)

- `any` 타입으로 타입 에러 우회
- 요청 범위를 벗어난 파일 수정
- 기존 테스트를 임의로 삭제하거나 skip 처리
- 환경변수 값을 코드에 직접 작성
- 공통 컴포넌트 무시하고 동일 기능 컴포넌트 중복 생성
- 레이어 참조 규칙 위반 (예: `features`에서 다른 `features` 직접 import)
- 슬라이스 내부에 `index.ts` 배럴 파일 생성
- `console.log`를 커밋에 포함

---

## 13. Performance Rules

### 렌더링 최적화

- 불필요한 re-render를 유발하지 않는다
    - 객체/배열 리터럴을 props로 직접 전달하지 않는다 (매 렌더마다 새 참조 생성)
    - 이벤트 핸들러는 컴포넌트 외부 또는 `useCallback`으로 안정적인 참조 유지
- `useMemo` / `useCallback`은 **실제 성능 이점이 측정된 경우에만** 사용
    - 단순 원시값 계산, 가벼운 연산에는 사용 지양 (오히려 오버헤드)
    - 사용 시 주석으로 이유 명시

``` typescript
// ❌ Bad
<Component style={{ color: 'red' }} />

// ✅ Good
const STYLE = { color: 'red' }
<Component style={STYLE} />
```

### useEffect 관리

- 의존성 배열은 항상 정확하게 명시 (누락·과잉 모두 금지)
- `eslint-plugin-react-hooks`의 exhaustive-deps 경고를 무시하지 않는다
- 불필요한 `useEffect` 사용 지양 — 파생 상태는 렌더 중 직접 계산

### 리스트 렌더링

- `key`는 **안정적인 고유값** 사용 (DB id 등)
- 배열 인덱스를 `key`로 사용하는 것은 **순서가 변하지 않는 정적 목록에 한해서만** 허용

### 코드 스플리팅

- 초기 번들에 불필요한 페이지·모달·무거운 컴포넌트는 `next/dynamic`으로 지연 로딩

``` typescript
const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
    ssr: false,
    loading: () => <Skeleton / >,
})
```

### 이미지 최적화

- 이미지는 반드시 `next/image` 컴포넌트 사용 (자동 최적화, lazy loading 적용)
- 외부 이미지 도메인은 `next.config.js`의 `images.domains`에 등록

### 라이브러리 추가 기준

- **minified 기준 50KB 이상** 추가되는 라이브러리는 팀 리뷰 후 도입
- 추가 전 [bundlephobia.com](https://bundlephobia.com)에서 번들 크기 확인
- 동일 기능이 이미 설치된 라이브러리로 구현 가능하면 새 라이브러리 추가 금지

### Never

- `key={Math.random()}` 또는 `key={index}` (동적 목록에서)
- 성능 측정 없이 `useMemo`/`useCallback` 남발
- `<img>` 태그 직접 사용 (Next.js 프로젝트에서)

---

## 14. Security Rules

### 입력값 검증

- 사용자 입력은 **클라이언트와 서버 양쪽 모두에서** 검증한다
- 클라이언트 검증만으로 보안을 보장하지 않는다 (우회 가능)

### XSS 방지

- `dangerouslySetInnerHTML` 사용 **금지**
    - 불가피한 경우 DOMPurify 등으로 반드시 sanitize 후 사용하고, 이유를 주석으로 명시
- API 응답 데이터를 그대로 렌더링하지 않고 **필요한 필드만 추출**해서 사용

``` typescript
// ❌ Bad: 서버 응답 전체를 innerHTML에 삽입
div.innerHTML = response.content

// ✅ Good: sanitize 후 사용 (불가피한 경우)
div.innerHTML = DOMPurify.sanitize(response.content)
```

### 인증 토큰 관리

- 인증 토큰을 `localStorage`에 직접 저장하지 않는다
    - **권장 방식**: httpOnly 쿠키 (서버에서 설정, JS 접근 불가)
    - 불가피하게 클라이언트 저장이 필요한 경우 의견 물어보기
- 토큰을 URL 파라미터나 쿼리스트링에 포함하지 않는다 (로그·히스토리 노출 위험)

### 민감 정보 처리

- 민감 정보(개인정보, 결제 정보 등)는 **서버에서만 처리**
- 클라이언트 코드에 비밀 키, API Secret 포함 **절대 금지**
    - `NEXT_PUBLIC_` 접두사가 없는 환경변수는 클라이언트에 노출되지 않음을 인지
- 로그에 비밀번호·토큰·개인정보가 출력되지 않도록 주의

### 외부 URL 처리

- 외부 URL로 리다이렉트 시 화이트리스트 검증 필수 (Open Redirect 방지)
- `target="_blank"` 사용 시 `rel="noopener noreferrer"` 반드시 추가

### Never

- `dangerouslySetInnerHTML`에 sanitize 없이 외부 데이터 삽입
- 환경변수 값(특히 Secret)을 클라이언트 코드에 하드코딩
- `localStorage`에 인증 토큰 저장
- 사용자 입력을 검증 없이 URL·SQL·명령어에 포함