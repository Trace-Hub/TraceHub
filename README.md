# 📌 프로젝트 개요

<img width="332" height="92" alt="TraceHub_logo" src="https://github.com/user-attachments/assets/08a7cf4b-f13f-46b1-9855-d748748fc2a2" />

> _"흩어진 에러 로그와 사용자 이벤트, 한 곳에서 추적(trace)하다"_
>
> 여러 도구에 흩어진 에러와 사용자 행동 데이터를 한 화면에서 확인하고,
> 문제 발생부터 원인 분석까지 이어지는 흐름을 제공하는 통합 모니터링 대시보드

서비스 운영 중 에러와 사용자 행동 데이터는 각각 Sentry, PostHog 같은 별도 도구에 흩어져 있어,
관리자가 매번 여러 대시보드를 오가며 상태를 파악해야 하는 불편함이 있었습니다.

TraceHub(트레이스허브)은 이러한 문제를 해결하기 위해 Sentry의 에러 데이터와 PostHog의 사용자 이벤트 데이터를
하나의 대시보드로 통합했습니다. 에러 목록 조회·분류·통계 분석, 사용자 행동 트렌드·퍼널·리텐션 분석을
한 곳에서 수행하고, 연동 상태를 실시간으로 확인할 수 있는 구조로 설계했습니다.

## 📎 관련 링크

- Service URL : [https://trace-hub-seven.vercel.app/dashboard](https://trace-hub-seven.vercel.app/dashboard)
- Project Document : [TraceHub Notion](https://parkgeunwon.notion.site/Trace-Hub-34a1ece0be12806b939ff51137f20417?source=copy_link)
- Design : [Figma](https://www.figma.com/design/1dh3jzfAQgW6WHGkOyXLaQ/TraceHub?node-id=0-1&t=FblmJuTfvMNji7aA-1)

## 👥 팀원 소개

|                                                                                        이혁준                                                                                        |                                                                                      박근원                                                                                      |
| :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| <img width="150" height="150" alt="image" src="https://github.com/user-attachments/assets/83a198ba-fe78-4962-b8e9-e3e7cf00d681" /> <br/>[@Lilium0422](https://github.com/Lilium0422) | <img width="150" height="150" alt="image" src="https://github.com/user-attachments/assets/e7f01a51-3bb2-4aed-965c-12596d6a656d" /> <br/>[@Geunone2](https://github.com/Geunone2) |
|                                                          메인 대시보드, 에러 대시보드 개발, <br>테마(라이트/다크 모드) 구현                                                          |                                                             기획 및 디자인 총괄,</br> 이벤트 대시보드, 환경설정 개발                                                             |

## 🛠️ 기술 스택

**Framework & Language**

![Next.js](https://img.shields.io/badge/Next.js_v16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript_v5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React_v19-61DAFB?style=for-the-badge&logo=react&logoColor=black)

**Styling & UI**

![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn/ui-000000?style=for-the-badge&logo=shadcnui&logoColor=white)

**State Management**

![TanStack Query](https://img.shields.io/badge/TanStack_Query_v5-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)

**Monitoring & Analytics**

![Sentry](https://img.shields.io/badge/Sentry-362D59?style=for-the-badge&logo=sentry&logoColor=white)
![PostHog](https://img.shields.io/badge/PostHog-F54E00?style=for-the-badge&logo=posthog&logoColor=white)

**Testing & Code Quality**

![Jest](https://img.shields.io/badge/Jest_v30-C21325?style=for-the-badge&logo=jest&logoColor=white)
![Testing Library](https://img.shields.io/badge/Testing_Library-E33332?style=for-the-badge&logo=testinglibrary&logoColor=white)
![Biome](https://img.shields.io/badge/Biome-60A5FA?style=for-the-badge&logo=biome&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint_v9-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)

**Infra & Tools**

![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)

## 📁 프로젝트 구조

FSD(Feature-Sliced Design) 기반 아키텍처를 사용합니다.

```plaintext
📦 tracehub/
├── 📁 app/                          # Next.js App Router (라우팅 + API)
│   ├── 📁 api/
│   │   ├── 📁 posthog/             # PostHog 데이터 조회 API Route
│   │   └── 📁 sentry/              # Sentry 데이터 조회 API Route
│   ├── 📁 dashboard/
│   │   ├── 📁 errors/              # 에러 대시보드 페이지 (list, analysis, [id])
│   │   ├── 📁 events/              # 이벤트 대시보드 페이지 (trends, funnels, paths, lifecycle, retention)
│   │   └── 📁 settings/            # 환경설정 페이지
│   └── layout.tsx                   # 루트 레이아웃
│
├── 📁 src/                          # 소스 코드 (FSD 레이어 구조)
│   ├── 📁 app-init/                 # Provider, PageviewTracker
│   ├── 📁 views/                    # 페이지 단위 뷰 컴포넌트
│   │   ├── 📁 dashboard/           # 메인 대시보드 뷰
│   │   ├── 📁 posthog/             # 이벤트 대시보드 뷰
│   │   └── 📁 sentry/              # 에러 대시보드 뷰
│   ├── 📁 widgets/                  # 복합 UI 블록 (차트, 통계 카드)
│   │   └── 📁 posthog/             # 이벤트 관련 위젯 (퍼널, 경로, 리텐션 등)
│   ├── 📁 features/                 # 독립적 기능 단위
│   │   └── 📁 settings/            # 설정 기능 (테마, 연동 테스트)
│   ├── 📁 entities/                 # 도메인 모델
│   │   ├── 📁 error/               # 에러 도메인 (api, model)
│   │   └── 📁 event/               # 이벤트 도메인 (api, model)
│   ├── 📁 shared/                   # 공용 리소스
│   │   ├── 📁 api/                  # fetch 클라이언트 래퍼
│   │   ├── 📁 config/              # 환경변수, 추적 경로, 차트 색상 등 설정 상수
│   │   ├── 📁 hooks/               # 범용 커스텀 훅
│   │   ├── 📁 lib/                  # 외부 라이브러리 래퍼 (dayjs, posthog 등)
│   │   ├── 📁 providers/           # ThemeProvider 등
│   │   └── 📁 ui/                   # 공통 UI 컴포넌트 (Button, Dropdown, ErrorCard 등)
│   └── 📁 styles/                   # 전역 CSS (디자인 토큰)
│
└── 📁 docs/                         # 연동 가이드 등 문서
```

## ✨ 주요 기능

### 메인 대시보드 — `/dashboard`

> 에러와 이벤트, 서비스의 오늘 상태를 첫 화면에서 한눈에

- **에러 Top 3** — 개발/프로덕션 환경 통합, 미해결 이슈 중 최신순 표시
- **이벤트 Top 3** — 최근 7일 발생량 상위 이벤트 (데이터 부족 시 30일로 자동 대체)
- **발생 추이 차트** — 에러/이벤트 토글 + 기간 선택(오늘/7일/30일)으로 추이 확인
- 진입 시 Sentry·PostHog 연결 상태를 자동 점검, 문제 시 토스트 알림

---

### 이벤트 대시보드 — PostHog 기반 사용자 행동 분석

> PostHog에 쌓인 사용자 행동 데이터를 트렌드, 퍼널, 경로 흐름, 라이프사이클, 리텐션까지 한 곳에서 분석

### Trends — `/dashboard/events/trends`

> 어떤 이벤트가 얼마나 발생하는지, 실시간 갱신되는 무한스크롤 목록과 시계열 차트

**화면 구성 (위 → 아래)**

1. **KPI 듀얼 패널** — 오늘(시간대별) / 최근 7일(일별) 활성 사용자 수·총 이벤트 수 + 증감 배지, 스파크라인 차트
2. **필터 바** — 기간(오늘/7일/30일) · 카테고리 · 경로 드롭다운 + 이벤트명 검색(Enter로 실행)
3. **이벤트 비교 차트** — 대표 이벤트 5종 발생량 비교 (7일/30일 기간에서만 표시)
4. **이벤트 카드 목록** — 발생량, 증감률, 피크 시점, 미니 차트 포함. cursor 기반 무한스크롤

**카테고리 분류**

| 카테고리 | 포함 이벤트              |
| -------- | ------------------------ |
| 탐색     | pageview, pageleave 등   |
| 인터랙션 | 클릭·폼 등 커스텀 이벤트 |
| 시스템   | `$` 접두사 이벤트        |

**자동 갱신** — 5분 주기, 카운트다운 표시. 무한스크롤 상태에서도 첫 페이지만 재조회하여 요청 폭증 방지, 스크롤 위치 보존.

---

### 이벤트 상세 — `/dashboard/events/[eventName]`

> 이벤트 하나를 골라 발생량·사용자·세션·발생 페이지·브라우저 환경까지 다각도로 분석

**화면 구성 (5개 섹션)**

1. **핵심 지표** — 총 발생 수 · 고유 사용자 수 · 세션 수 + 이전 기간 대비 증감률
2. **인사이트** — 수치를 해석한 요약 문구 + PostHog 원본 데이터 딥링크
3. **발생 추이** — 기간 탭 연동 시계열 차트 (오늘=시간대별, 그 외=일별)
4. **연관 분석** — 이벤트 발생 페이지 목록 → 해당 페이지 내 상위 5개 이벤트 분포 도넛 차트
5. **프로퍼티 분포** — 브라우저 / OS / 발생 URL / 직전 페이지 각 상위 10개. URL은 개발(localhost)/프로덕션 자동 구분

---

### Funnels — `/dashboard/events/funnels`

> 코드 몇 줄로 정의하는 전환 퍼널, 어느 단계에서 사용자가 이탈하는지 즉시 파악

**화면 구성**

1. **기간 탭** — 7일 / 30일
2. **퍼널 선택 드롭다운** — `funnelConfig.ts`에 정의된 퍼널 (기본 제공 3종: 기본 플로우, 폼 진입, 클릭 전환)
3. **KPI 카드 2개** — 전체 전환율 / 최대 이탈 단계(이탈률 + 단계명)
4. **단계별 카드 + 깔때기 차트** — 단계마다 도달 인원·전환율 시각화
5. **전환율 추이 차트** — 기간 내 일자별 전환율 변화

**집계 기준** — person 단위로 이벤트 발생 여부를 판정하여 단계 통과 계산. 퍼널 추가는 `funnelConfig.ts`에 이벤트 순서 배열만 정의하면 자동 반영.

---

### Paths — `/dashboard/events/paths`

> 사용자가 어디서 들어와 어디로 흘러가는지, 세션 단위 페이지 이동을 Sankey 차트로 시각화

**화면 구성**

1. **기간 탭 + KPI 카드 2개** — 상위 시작 경로 / 상위 이탈 경로 (세션 수 표시)
2. **시작 경로 드롭다운** — "전체 경로" 또는 특정 경로 선택
3. **탐색 단계 수 드롭다운** — 1~5단계 (기본 3단계)
4. **Sankey 차트** — 단계별 상위 4개 경로 노출, 나머지 "기타"로 묶어 가독성 유지. 구간별 평균 체류 시간 표시

**집계 기준**

- 세션(`$session_id`) 단위로 여정을 그림
- "전체 경로" 선택 시: 세션이 실제로 시작된 페이지가 Step 0
- 특정 경로 선택 시: 세션 중 그 경로를 처음 만난 지점이 Step 0 (세션의 첫 페이지가 아닐 수 있음)

---

### Lifecycle — `/dashboard/events/lifecycle`

> 사용자 구성이 건강한가 — 활동 패턴에 따라 사용자를 6단계로 자동 분류

**화면 구성**

1. **활성 사용자 요약** — 7일/30일 윈도우 내 활성 사용자 수 + 직전 기간 대비 증감
2. **세그먼트 카드 6개** — 분류별 인원수와 비율
3. **전체 사용자 분포 차트** — 세그먼트 구성비 시각화

**6개 세그먼트 분류 기준**

| 세그먼트     | 기준                                            |
| ------------ | ----------------------------------------------- |
| New          | 활성 윈도우 내 방문 1회 (처음 온 사용자)        |
| Evaluating   | 활성 윈도우 내 방문 2~3회 (탐색 중)             |
| Engaged      | 활성 윈도우 내 방문 4회 이상 (정착)             |
| Bounced      | 최근 비활성 + 전체 방문 1회뿐 (한 번 오고 떠남) |
| Lapsing      | 최근 비활성 + 과거 여러 번 방문 (이탈 위험)     |
| Disappearing | 장기 비활성 (휴면 직전)                         |

- 활성 윈도우: 7일 탭 = 최근 7일 / 30일 탭 = 최근 30일 (롤링)
- 조회 범위: 7일 탭 = 60일 / 30일 탭 = 90일 룩백, person 단위 집계

---

### Retention — `/dashboard/events/retention`

> 이번 주 온 사용자가 다음 주에도 오는가 — 12주 주간 코호트 리텐션 히트맵

**화면 구성**

1. **KPI 카드 4개** — 평균 Week 1 리텐션율 / 최고 리텐션 코호트 / 전체 추적 사용자 수 / 이번 주 신규 규모
2. **콤보 차트** — 주차별 신규 사용자 수(막대) + Week 1 잔존율(라인)
3. **하프 파이 차트** — 전체 추적 사용자 중 재방문 비율
4. **코호트 히트맵** — 첫 방문 주(행) × 경과 주차(열), 잔존율에 따라 색 농도 표현

**집계 기준** — 첫 방문 주 기준 코호트, 최근 12주 추적, 주 시작은 월요일(KST), person 단위

## 에러 대시보드 — Sentry 기반 에러 실시간 조회

### Trends — `/dashboard/errors/list`

> Sentry Issue 기반 에러 목록을 무한스크롤로 조회하고, 분류·환경·검색으로 필터링

**화면 구성**

1. **필터 바** — 상태(미해결/무시/해결) · 분류(신규/재발/급증/장기미해결) · 환경 · 키워드 검색
2. **에러 카드 목록** — 분류 배지, 발생 횟수, 영향 사용자, 최초/최종 발생 시각 및 환경 표시. cursor 기반 무한스크롤 (5개씩 로드)

**분류 기준**

| 분류       | 기준                                          |
| ---------- | --------------------------------------------- |
| 신규       | firstSeen이 최근 24시간 이내                  |
| 재발       | 이전에 해결됐다가 다시 발생한 이슈            |
| 급증       | 최근 발생 빈도가 이전 대비 급격히 증가        |
| 장기미해결 | firstSeen이 30일 이상 경과 + 미해결 상태 유지 |

- 검색은 Sentry API 서버 사이드 필터링 (query 파라미터)
- 페이지네이션은 Sentry cursor 기반

---

### 에러 상세 — `/dashboard/errors/[id]`

> 개별 에러의 발생 추이와 환경 분포를 시각화

**화면 구성**

1. **에러 요약 카드** — 제목, culprit, 상태, 레벨, 발생 횟수, 영향 사용자
2. **시간대별 발생 현황 차트** — 24시간 / 7일 / 30일 기간 선택
3. **태그 분포 차트** — 브라우저 / OS / 환경별 분포

**집계 기준** — 24시간은 1시간 간격, 7일은 1일 간격, 30일은 1일 간격으로 집계.

---

### Analysis — `/dashboard/errors/analysis`

> 에러 데이터를 통계적으로 분석하여 패턴과 핫스팟을 파악

**화면 구성**

1. **분류별 통계** — 신규 / 재발 / 급증 / 장기미해결 건수 및 비율 카드
2. **상태 코드별 / 에러 타입별 통계** — 도넛 차트 + 프로그레스 바
3. **에러 발생 위치 Top 5** — culprit 기준 핫스팟 도넛 차트 + 위치별 상세

**집계 기준**

- 상태 코드: 이슈의 `httpStatusCode` 태그 기반, 없으면 title에서 HTTP 상태 코드 패턴 추출 (fallback)
- Server Error(5xx) / Client Error(4xx) / Other 3개 카테고리로 분류
- 에러 발생 위치: `culprit` 필드 기준으로 그룹핑, 이슈 수 및 총 발생 횟수 집계

## 환경설정 — `/dashboard/settings`

- **테마 변경** — 라이트 / 다크 모드 / 시스템 설정 연동
- **연동 상태 확인** — Sentry · PostHog 연결 테스트, 실패 사유별 안내

## 🎨 공통 UX

| 항목            | 설명                                                                                       |
| --------------- | ------------------------------------------------------------------------------------------ |
| 반응형 레이아웃 | 모바일 퍼스트 설계, 전 화면 태블릿·데스크톱 대응. 사이드바는 모바일에서 햄버거 메뉴로 전환 |
| 다크 모드       | 라이트 / 다크 / 시스템 설정 연동. FOUC 방지 처리 적용                                      |
| 기간 필터       | 오늘 / 최근 7일 / 최근 30일 (KST 기준) — 화면별 탭·드롭다운으로 제공                       |
| 로딩/에러 UX    | 화면별 스켈레톤 로딩, 실패 시 토스트 + 빈 상태(EmptyState) 표시                            |
| 숫자 애니메이션 | KPI 수치 카운트업 애니메이션                                                               |
| PostHog 딥링크  | 대시보드 수치에서 PostHog 원본 이벤트 화면으로 한 클릭 이동                                |
| 연결 테스트     | 설정 페이지에서 Sentry/PostHog 연동 상태 확인, 실패 사유별 안내                            |

## ⚙️ 기술적 특징

1. **서버 사이드 HogQL 조회** — 모든 분석 쿼리는 Next.js API Route에서 PostHog HogQL API를 호출합니다. Personal API Key는 `NEXT_PUBLIC_` 접두사 없는 서버 전용 환경변수로 관리되어 브라우저에 노출되지 않습니다.
2. **타입 세이프 이벤트 트래킹** — 이벤트명은 `tracking.ts` 상수로만 정의하고 `trackEvent()` 래퍼로만 전송합니다. 오타·미등록 이벤트는 TypeScript 타입 에러로 차단됩니다.
3. **설정 파일 기반 커스터마이징** — 분석 대상 경로(`trackedPaths.ts`)와 퍼널(`funnelConfig.ts`)을 코드 몇 줄로 정의하면 대시보드에 자동 반영됩니다.
4. **요청량을 고려한 자동 갱신** — 트렌드 화면은 5분 주기 갱신 시 첫 페이지만 재조회하여, 무한스크롤 상태에서도 요청 폭증 없이 최신화합니다.
5. **SSR Prefetch + TanStack Query** — 서버에서 데이터를 미리 패칭해 하이드레이션하므로 초기 로딩이 빠릅니다.
6. **원본 데이터 접근성** — 가공된 수치에서 한 클릭으로 PostHog 원본 이벤트로 이동하여 검증할 수 있습니다.

## 🤝 기여하기

TraceHub에 대한 버그 제보, 기능 제안, 코드 기여를 환영합니다.

### 기여 절차

1. 이 저장소를 **Fork**합니다.
2. Fork한 저장소를 로컬에 **Clone**합니다.
   ```bash
   git clone https://github.com/{본인계정}/tracehub.git
   cd tracehub
   pnpm install
   ```
3. 이슈를 확인하거나 새로 생성합니다.
4. 브랜치를 생성합니다. (`#{이슈번호}-{타입}-{작업설명}`)
5. 코드를 수정하고 린트·타입 체크를 통과시킵니다.
   ```bash
   pnpm lint
   pnpm type-check
   ```
6. 커밋 컨벤션에 맞게 커밋합니다. (`.github/.gitmessage.txt` 참고)
7. Fork한 저장소에 Push 후 원본 저장소로 **Pull Request**를 생성합니다.

### 지켜야 할 규칙

- FSD 레이어 구조를 따릅니다. 같은 레이어 간 참조는 금지입니다.
- `any` 사용 금지, `console.log` 커밋 금지
- 공통 컴포넌트는 `shared/ui/`를 먼저 확인하고 중복 생성하지 않습니다.
- 새 라이브러리 추가 시 팀 리뷰가 필요합니다.
- 상세 코딩 규칙은 `AGENTS.md`를 참고합니다.
