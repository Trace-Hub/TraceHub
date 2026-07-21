# Sentry 연동 가이드

TraceHub의 에러 대시보드는 Sentry를 데이터 소스로 사용합니다.
이 문서는 모니터링 대상 앱의 Sentry SDK 설정부터 TraceHub 환경변수 설정, 대시보드 사용법,
집계 기준과 문제 해결 방법까지 TraceHub를 배포해서 사용하는 데 필요한 전체 과정을 안내합니다.

**목차**

- [🚀 빠른 시작 체크리스트](#-빠른-시작-체크리스트)
- [1. 연동 구조 이해](#1-연동-구조-이해)
- [2. 준비 사항](#2-준비-사항)
- [3. Sentry 조직과 프로젝트 준비](#3-sentry-조직과-프로젝트-준비)
- [4. 모니터링 대상 앱에 Sentry SDK 설정](#4-모니터링-대상-앱에-sentry-sdk-설정)
- [5. TraceHub 조회 API 설정](#5-tracehub-조회-api-설정)
- [6. 로컬 실행과 단계별 검증](#6-로컬-실행과-단계별-검증)
- [7. TraceHub의 Sentry 데이터 처리 기준](#7-tracehub의-sentry-데이터-처리-기준)
- [8. 연결 실패 문제 해결](#8-연결-실패-문제-해결)
- [9. 배포 환경 설정](#9-배포-환경-설정)
- [10. 보안 체크리스트](#10-보안-체크리스트)
- [11. 현재 지원 범위와 제한](#11-현재-지원-범위와-제한)

---

## 🚀 빠른 시작 체크리스트

처음 도입한다면 아래 순서대로 진행하세요.

1. **준비물 확인** — Node.js, pnpm, Sentry 계정, 모니터링 대상 앱의 설정 권한
2. **프로젝트 실행 준비**

   ```bash
   git clone <저장소 URL>
   cd TraceHub
   pnpm install
   ```

3. **Sentry 프로젝트 준비** — 모니터링 대상 앱의 에러를 저장할 조직과 프로젝트 생성
4. **대상 앱 SDK 연결** — 대상 앱에 Sentry SDK와 DSN을 설정하고 Sentry Issues에서 테스트 에러 확인
5. **TraceHub 조회 환경변수 설정** — `.env`에 API Token, Organization Slug, Project Slug 입력
6. **개발 서버 실행 및 연결 확인** — `pnpm dev` 실행 후 `/dashboard/settings`에서 연결 테스트
7. **에러 대시보드 확인** — `/dashboard/errors/list`에서 프로젝트 이슈가 표시되는지 확인
8. **집계 기준 확인** — 분류 공식, KST 기간 기준, 화면별 조회 범위를 7장에서 확인

각 단계에서 막히면 [8. 연결 실패 문제 해결](#8-연결-실패-문제-해결)을 참고하세요.

> **먼저 구분해야 할 핵심:** 대상 앱의 SDK와 DSN은 에러를 Sentry로 **전송**하기 위한 설정이고, TraceHub의 API Token과 Slug는 Sentry 데이터를 **조회**하기 위한 설정입니다.

---

## 1. 연동 구조 이해

Sentry 연동에는 서로 목적이 다른 두 설정이 필요합니다.

```text
[모니터링 대상 앱]
        │  Sentry SDK + 대상 앱의 DSN
        │  에러 이벤트 전송
        ▼
[Sentry 조직 / 프로젝트]
        ▲
        │  Sentry REST API + 읽기 토큰
        │  이슈·통계·태그 조회
[TraceHub 서버]
        │
        ▼
[TraceHub 대시보드]
```

| 구분                                     | 설정 위치          | 목적                                    | TraceHub 조회에 필요한가 |
| ---------------------------------------- | ------------------ | --------------------------------------- | ------------------------ |
| Sentry SDK와 DSN                         | 모니터링 대상 앱   | 에러를 Sentry로 전송                    | 대상 앱에 필요           |
| API Token·Organization Slug·Project Slug | TraceHub           | Sentry 데이터를 읽어 대시보드에 표시    | 필수                     |
| TraceHub 자체 DSN                        | TraceHub           | TraceHub 자체 오류를 별도 모니터링      | 선택                     |
| Source Map 업로드 토큰                   | TraceHub 빌드 환경 | TraceHub 자체 오류의 난독화된 스택 복원 | 선택                     |

> **핵심:** DSN은 데이터를 보내는 주소이고 API Token은 데이터를 읽는 자격 증명입니다. 둘은 서로 대체할 수 없습니다.

모니터링 대상 앱이 이미 Sentry에 에러를 정상 전송하고 있다면 4장은 건너뛰고 5장부터 진행해도 됩니다.

---

## 2. 준비 사항

- Sentry 계정
- 데이터를 저장할 Sentry 조직(Organization)과 프로젝트(Project)
- 모니터링 대상 앱의 설정 권한
- TraceHub 저장소와 환경변수 설정 권한
- Node.js 20 이상, pnpm 10 이상

먼저 다음 대상을 구분해 두는 것이 좋습니다.

| 항목              | 예시           | 설명                      |
| ----------------- | -------------- | ------------------------- |
| 조직 이름         | `My Company`   | 화면에 표시되는 이름      |
| Organization Slug | `my-company`   | API URL에 사용되는 식별자 |
| 프로젝트 이름     | `Web Frontend` | 화면에 표시되는 이름      |
| Project Slug      | `web-frontend` | API URL에 사용되는 식별자 |

TraceHub에는 표시 이름이 아니라 **Slug**를 입력해야 합니다.

---

## 3. Sentry 조직과 프로젝트 준비

### 3.1 조직 생성 또는 선택

1. Sentry에 로그인합니다.
2. 기존 조직을 선택하거나 새 조직을 생성합니다.
3. **Settings → General Settings**에서 Organization Slug를 확인합니다.
4. 확인한 Slug는 5장에서 `NEXT_SENTRY_ORG`에 입력합니다.

### 3.2 프로젝트 생성 또는 선택

1. 조직에서 **Projects → Create Project**를 선택합니다.
2. 모니터링 대상 앱의 프레임워크를 선택합니다.
3. 프로젝트 이름과 담당 팀을 지정합니다.
4. **Project Settings → General Settings**에서 Project Slug를 확인합니다.
5. 확인한 Slug는 5장에서 `NEXT_SENTRY_PROJECT`에 입력합니다.

Sentry 메뉴명은 서비스 업데이트나 권한에 따라 다르게 표시될 수 있습니다. 메뉴가 보이지 않으면 조직 관리자에게 프로젝트와 토큰 생성 권한을 요청하십시오.

---

## 4. 모니터링 대상 앱에 Sentry SDK 설정

이 단계는 **에러를 발생시키는 실제 서비스 앱**에서 수행합니다. TraceHub 저장소에 다른 서비스의 DSN을 넣는 단계가 아닙니다.

### 4.1 프레임워크별 SDK 설치

Sentry 프로젝트의 **Set Up SDK** 안내에 따라 대상 앱의 프레임워크용 SDK를 설치합니다. Next.js 앱에서 pnpm을 사용한다면 다음과 같이 공식 설정 마법사를 실행할 수 있습니다.

```bash
pnpm dlx @sentry/wizard@latest -i nextjs
```

마법사가 생성하거나 수정하는 파일은 대상 앱의 프레임워크와 SDK 버전에 따라 달라질 수 있으므로, 실행 후 Git Diff를 반드시 확인합니다.

### 4.2 대상 앱에 DSN 설정

Sentry의 **Project Settings → Client Keys (DSN)**에서 DSN을 확인합니다. 환경변수 이름은 대상 앱의 SDK 구성에 맞춰 사용하십시오.

```dotenv
# 예시일 뿐이며 실제 값은 저장소에 커밋하지 않습니다.
NEXT_PUBLIC_SENTRY_DSN=https://PUBLIC_KEY@o000000.ingest.sentry.io/0000000
```

DSN은 이벤트 전송 목적상 브라우저에 포함될 수 있는 공개 식별자입니다. 그러나 임의 이벤트 유입과 프로젝트 정보 노출을 줄이기 위해 문서·이슈·스크린샷에 실제 값을 게시하지 않는 것을 권장합니다.

### 4.3 사용자 식별 설정

Sentry의 영향 사용자(`userCount`)를 사용하려면 대상 앱에서 로그인 완료 후 사용자 컨텍스트를 설정해야 합니다.

```ts
import * as Sentry from "@sentry/nextjs";

Sentry.setUser({
  id: user.id,
});
```

- 이메일·이름 등 개인정보는 업무상 필요한 경우에만 전송합니다.
- 로그아웃 시 `Sentry.setUser(null)`로 사용자 컨텍스트를 제거합니다.
- 사용자 컨텍스트가 없거나 Sentry가 사용자를 식별하지 못한 이벤트는 TraceHub에서 영향 사용자가 `0명`으로 표시될 수 있습니다.

### 4.4 환경 태그 확인

TraceHub는 Sentry 이슈의 `environment` 태그를 사용합니다. SDK가 `production`, `development`, `staging` 등 일관된 값을 보내도록 설정하십시오. 대상 앱의 실제 태그 값과 TraceHub 필터 값이 다르면 목록이 비어 보일 수 있습니다.

### 4.5 수집 여부 검증

대상 앱에서 의도적인 예외를 한 번 발생시킨 뒤 Sentry의 **Issues**에서 확인합니다. 테스트용 코드는 검증 후 즉시 제거하고 프로덕션에 공개하지 마십시오.

```ts
throw new Error("Sentry SDK integration test");
```

다음 항목을 모두 확인해야 SDK 연동이 완료된 것입니다.

- Sentry Issues에 테스트 이슈가 생성됨
- 이벤트의 프로젝트가 TraceHub에서 조회할 프로젝트와 동일함
- 이벤트의 environment 값이 의도한 값과 동일함
- 사용자 식별이 필요하다면 User 정보가 이벤트에 포함됨
- 배포 환경의 스택 추적이 필요한 경우 Source Map이 정상 적용됨

> Sentry에 이벤트가 보이지 않는 상태에서는 TraceHub 환경변수를 변경해도 데이터가 나타나지 않습니다. 먼저 대상 앱 → Sentry 전송을 해결해야 합니다.

---

## 5. TraceHub 조회 API 설정

TraceHub는 브라우저에서 Sentry API를 직접 호출하지 않습니다. Next.js API Route가 서버에서 토큰을 사용해 Sentry 데이터를 조회합니다.

### 5.1 읽기 전용 API Token 발급

1. Sentry의 사용자 또는 조직 설정에서 **Developer Settings → Auth Tokens**로 이동합니다.
2. 새 토큰을 생성합니다.
3. 다음 데이터를 읽을 수 있도록 최소 권한을 부여합니다.
   - 조직 목록과 조직 정보
   - 프로젝트 및 이슈 목록
   - 개별 이슈와 이슈 태그
   - 오류 이벤트 통계
4. 생성 직후 표시되는 토큰을 안전한 비밀 저장소에 보관합니다.

Sentry 계정 유형과 UI 버전에 따라 권한명이 `org:read`, `project:read`, `event:read`처럼 표시되거나 리소스별 Read 권한으로 표시될 수 있습니다. 먼저 읽기 권한만 부여하고, 403 응답이 확인될 때 필요한 읽기 권한만 추가하십시오. 쓰기·관리자 권한은 TraceHub 조회에 필요하지 않습니다.

### 5.2 `.env` 작성

TraceHub 프로젝트 루트의 `.env`에 다음 세 값을 설정합니다.

```dotenv
NEXT_SENTRY_API_TOKEN=sntrys_your_read_only_token
NEXT_SENTRY_ORG=your-organization-slug
NEXT_SENTRY_PROJECT=your-project-slug
```

| 환경변수                | 필수 | 사용 위치     | 설명                            |
| ----------------------- | ---- | ------------- | ------------------------------- |
| `NEXT_SENTRY_API_TOKEN` | 예   | TraceHub 서버 | Sentry REST API Bearer 인증     |
| `NEXT_SENTRY_ORG`       | 예   | TraceHub 서버 | 조회할 Organization Slug        |
| `NEXT_SENTRY_PROJECT`   | 예   | TraceHub 서버 | 이슈 목록을 조회할 Project Slug |

세 변수에는 `NEXT_PUBLIC_` 접두사를 붙이지 마십시오. 서버 전용 비밀값이며 브라우저 번들에 포함되어서는 안 됩니다.

### 5.3 선택 환경변수와 혼동하지 않기

다음 두 값은 외부 프로젝트 데이터를 TraceHub에서 **조회하는 데 필요하지 않습니다**.

| 환경변수                 | 용도                                             | 일반 사용자 설정 여부                                  |
| ------------------------ | ------------------------------------------------ | ------------------------------------------------------ |
| `NEXT_PUBLIC_SENTRY_DSN` | TraceHub 앱 자체에서 발생한 오류를 Sentry로 전송 | TraceHub 자체 모니터링이 필요할 때만 설정              |
| `SENTRY_AUTH_TOKEN`      | TraceHub 프로덕션 빌드 중 Source Map 업로드      | TraceHub 자체 모니터링과 Source Map이 필요할 때만 설정 |

현재 `next.config.ts`의 Sentry Source Map 업로드 대상 조직·프로젝트는 TraceHub 개발 프로젝트 값으로 구성되어 있습니다. 별도 배포자가 `SENTRY_AUTH_TOKEN`을 설정하려면 먼저 해당 설정도 자신의 Sentry 조직과 프로젝트로 변경해야 합니다. 그렇지 않으면 빌드 실패 또는 잘못된 업로드 대상 문제가 발생할 수 있습니다.

> 보안을 위해 단순 대시보드 조회만 필요한 사용자에게 `NEXT_PUBLIC_SENTRY_DSN`이나 `SENTRY_AUTH_TOKEN`을 공유하지 마십시오.

### 5.4 환경변수 적용

환경변수를 추가하거나 변경한 뒤 실행 중인 개발 서버를 다시 시작합니다.

```bash
pnpm dev
```

환경변수는 서버 시작 시 로드되므로 브라우저 새로고침만으로는 변경 사항이 반영되지 않을 수 있습니다.

---

## 6. 로컬 실행과 단계별 검증

연동 문제를 빠르게 구분하려면 다음 순서로 확인합니다.

### 6.1 1단계: 대상 앱 → Sentry

Sentry Issues에서 대상 앱의 테스트 이슈가 보이는지 확인합니다. 보이지 않는다면 대상 앱의 SDK·DSN·네트워크 설정 문제이며 TraceHub 조회 설정과는 무관합니다.

### 6.2 2단계: TraceHub 토큰 기본 연결

TraceHub 실행 후 다음 주소를 호출합니다.

```bash
curl http://localhost:3000/api/sentry/test
```

성공 응답:

```json
{ "connected": true }
```

실패 응답 예시:

```json
{ "connected": false, "reason": "env_missing" }
```

| reason          | 의미                                    | 우선 확인할 항목                    |
| --------------- | --------------------------------------- | ----------------------------------- |
| `env_missing`   | API Token 또는 Organization Slug가 없음 | `.env`, 변수명, 서버 재시작         |
| `invalid_token` | Sentry가 401을 반환함                   | 토큰 오타·만료·폐기 여부            |
| `api_error`     | 그 외 API 오류 또는 네트워크 오류       | 권한, Sentry 상태, 방화벽, 타임아웃 |

#### 연결 테스트가 확인하는 범위

`/api/sentry/test`는 다음 두 가지만 실질적으로 확인합니다.

1. `NEXT_SENTRY_API_TOKEN`, `NEXT_SENTRY_ORG`가 존재하는가
2. 해당 토큰으로 Sentry의 조직 목록 API가 성공하는가

다음 항목은 확인하지 않습니다.

- 설정한 Organization Slug가 토큰의 조직 목록에 실제로 포함되는지
- `NEXT_SENTRY_PROJECT`가 존재하는지
- 해당 프로젝트의 이슈를 읽을 권한이 있는지
- 이슈 태그와 오류 통계를 읽을 권한이 있는지
- 대상 앱의 SDK 또는 DSN이 이벤트를 정상 전송하는지
- `NEXT_PUBLIC_SENTRY_DSN` 또는 `SENTRY_AUTH_TOKEN`이 유효한지

따라서 `{ "connected": true }`는 **토큰의 기본 API 접근 성공**을 의미할 뿐, 전체 대시보드 연동 완료를 보장하지 않습니다.

### 6.3 3단계: 프로젝트 이슈 조회

다음 API를 호출해 프로젝트·권한·이슈 조회를 함께 확인합니다.

```bash
curl "http://localhost:3000/api/sentry/issues?status=unresolved&environment=production"
```

환경 필터 때문에 결과가 없을 수 있습니다. Sentry 이벤트의 environment 값에 맞게 변경하거나 파라미터를 제거해 다시 확인하십시오.

### 6.4 4단계: 화면 확인

1. `http://localhost:3000/dashboard/settings`에서 연결 상태를 확인합니다.
2. `http://localhost:3000/dashboard/errors/list`에서 이슈 목록을 확인합니다.
3. 이슈 카드를 선택해 상세 통계와 브라우저·OS·환경 태그를 확인합니다.
4. `http://localhost:3000/dashboard/errors/analysis`에서 분석 데이터를 확인합니다.

대시보드 첫 진입 시 연결 테스트가 자동 실행되며 실패 사유가 토스트로 표시됩니다. 네트워크 요청 자체가 거부되는 경우에는 현재 자동 토스트가 표시되지 않을 수 있으므로 브라우저 개발자 도구의 Network 탭도 함께 확인하십시오.

---

## 7. TraceHub의 Sentry 데이터 처리 기준

화면별 수치의 조회 범위와 계산 방식이 다르므로 같은 숫자로 해석해서는 안 됩니다.

### 7.1 Trends 에러 목록

- Sentry 프로젝트 Issues API를 사용합니다.
- 기본 페이지 크기는 5개이며 Sentry cursor로 다음 페이지를 조회합니다.
- 상태는 `unresolved`, `ignored`, `resolved`를 지원합니다.
- 상태·환경·검색어는 Sentry API에서 필터링합니다.
- 분류 필터는 조회된 이슈를 TraceHub 클라이언트에서 필터링합니다.
- 각 이슈의 `http.status_code`와 `environment` 태그를 추가 조회합니다.

#### 분류 공식

| 표시 분류  | 현재 계산식                                    |
| ---------- | ---------------------------------------------- |
| 신규       | `firstSeen`으로부터 7일 미만이고 `count === 1` |
| 급증       | `firstSeen`으로부터 7일 미만이고 `count >= 10` |
| 재발       | `count > 1`                                    |
| 장기미해결 | `firstSeen`으로부터 7일 이상                   |

분류는 상호 배타적이지 않습니다. 예를 들어 7일 이내 10회 이상 발생한 이슈는 **급증**과 **재발**이 함께 표시됩니다.

> 현재의 `재발`은 Sentry에서 해결된 뒤 다시 발생한 regression 여부를 검사하지 않고 단순히 누적 발생 횟수가 2회 이상인지 판단합니다. `급증`도 이전 기간 대비 증가율을 계산하지 않습니다. 분류명은 운영 판단을 돕는 UI 라벨이며 Sentry 고유 상태와 동일하지 않습니다.

### 7.2 에러 상세 통계

- 선택한 이슈 한 건을 `issue.id`로 필터링합니다.
- `24h`는 최근 24시간이 아니라 **KST 오늘 00:00~23:59:59**입니다.
- `24h`는 1시간 단위 24개 슬롯으로 표시하며 아직 오지 않은 시간은 0으로 표시될 수 있습니다.
- `7d`는 KST 오늘을 포함한 7개 달력일입니다.
- `30d`는 KST 오늘을 포함한 30개 달력일입니다.
- 7일·30일 데이터는 Sentry에서 시간 단위로 받은 뒤 KST 날짜별로 합산합니다.
- 브라우저·OS·환경 분포는 이슈 태그의 `topValues`를 기준으로 계산합니다.

### 7.3 Overview 오류 추이

- Sentry 조직의 `events-stats`에서 `dataset=errors`, `field=count()`를 조회합니다.
- 기간과 KST 집계 방식은 에러 상세 통계와 동일합니다.
- 현재 요청에는 Project Slug 필터가 포함되지 않습니다.

따라서 하나의 Sentry 조직에 여러 프로젝트가 있다면 Overview 오류 추이는 **조직 전체 오류**를 포함할 수 있지만, Trends 목록은 `NEXT_SENTRY_PROJECT`로 지정한 프로젝트만 보여줍니다.

### 7.4 Analysis 통계

Analysis 화면은 `NEXT_SENTRY_PROJECT`로 지정한 **프로젝트 전체 에러**를 분석하는 화면입니다. 환경·상태·카테고리 필터를 적용하고 다음 값을 계산합니다.

- Server Error: `http.status_code` 또는 제목에서 추출한 500~599
- Client Error: `http.status_code` 또는 제목에서 추출한 400~499
- Other: 위 범위에 속하지 않는 이슈
- 분류별 통계: 신규·재발·급증·장기미해결에 해당하는 이슈 수와 비율
- 상태 코드 통계: 상태 코드별 이슈의 누적 `count` 합계
- 에러 타입 통계: `metadata.type`별 이슈 개수
- 핫스팟: `culprit`별 이슈 개수와 누적 발생 횟수

Trends의 무한스크롤 페이지 크기인 5개는 목록을 나누어 불러오기 위한 단위일 뿐, Analysis의 통계 범위를 의미하지 않습니다. Analysis 수치는 선택한 프로젝트 전체 이슈를 기준으로 해석합니다.

### 7.5 영향 사용자 0명

다음 상황에서는 에러가 발생했어도 영향 사용자가 0명으로 표시될 수 있습니다.

- 대상 앱이 Sentry 사용자 컨텍스트를 설정하지 않음
- 로그인 전 또는 익명 사용자에게서 발생함
- 개인정보 필터링으로 사용자 정보가 제거됨
- SDK의 PII 설정이나 조직 데이터 스크러빙 정책이 사용자 정보를 제외함
- 해당 이슈 이벤트에 Sentry가 식별 가능한 사용자 값이 없음

이는 에러 미수집을 의미하지 않습니다. 이슈의 발생 횟수와 이벤트 상세를 함께 확인하십시오.

---

## 8. 연결 실패 문제 해결

### 이슈 목록이 500을 반환하는 경우

- 세 필수 환경변수가 모두 설정됐는지 확인합니다.
- Organization Slug와 Project Slug에 표시 이름을 입력하지 않았는지 확인합니다.
- 토큰이 해당 조직과 프로젝트를 읽을 수 있는지 확인합니다.
- 환경변수 변경 후 TraceHub 서버를 재시작했는지 확인합니다.

### 연결 테스트는 성공하지만 대시보드가 실패하는 경우

연결 테스트는 프로젝트 접근을 확인하지 않습니다. 다음 순서로 확인합니다.

1. `NEXT_SENTRY_PROJECT` 오타 확인
2. 토큰의 프로젝트·이슈·이벤트 읽기 권한 확인
3. 대상 프로젝트가 `NEXT_SENTRY_ORG` 조직에 속하는지 확인
4. `/api/sentry/issues`와 `/api/sentry/stats`의 응답 상태 확인
5. Sentry에서 해당 프로젝트의 실제 이슈 존재 여부 확인

### 목록이 비어 있는 경우

- 상태 필터를 `상태 전체`로 변경합니다.
- 환경 필터와 실제 Sentry `environment` 태그를 비교합니다.
- 검색어를 제거합니다.
- Sentry 프로젝트를 직접 열어 같은 조건의 이슈가 존재하는지 확인합니다.
- 분류 필터는 조회된 페이지에서 클라이언트 측으로 적용되므로 다음 페이지 로드 후 결과가 나타날 수 있습니다.

### 401 Unauthorized

토큰이 잘못됐거나 만료·폐기됐을 가능성이 높습니다. 새 읽기 토큰을 발급하고 서버를 다시 시작합니다.

### 403 Forbidden

토큰은 유효하지만 요청 리소스의 읽기 권한이 부족하거나 해당 조직·프로젝트에 접근할 수 없습니다. 관리자 권한을 일괄 부여하지 말고 누락된 읽기 권한만 추가합니다.

### 404 Not Found

Organization Slug, Project Slug 또는 이슈 ID가 잘못됐거나 토큰이 해당 리소스를 볼 수 없는 경우입니다. Sentry URL에 표시된 Slug와 `.env`를 비교합니다.

### 요청 시간 초과 또는 `api_error`

TraceHub의 Sentry API 요청 기본 제한 시간은 10초입니다. Sentry 상태, 로컬 네트워크, 프록시, 방화벽을 확인한 뒤 재시도합니다.

### 태그 또는 상태 코드가 보이지 않는 경우

`environment`, `browser.name`, `os.name`, `http.status_code`는 모든 이벤트에 자동으로 존재하지 않습니다. 특히 `http.status_code`는 대상 앱의 SDK 설정 또는 수동 태깅 방식에 따라 누락될 수 있습니다. TraceHub 저장소의 현재 Sentry 설정은 에러 발생 전 마지막 HTTP/fetch breadcrumb에 상태 코드가 있을 때만 `http.status_code`를 이벤트 태그에 추가합니다.

### Source Map 관련 오류

Source Map은 TraceHub의 데이터 조회 필수 조건이 아닙니다. Sentry에서 스택이 난독화되어 보이더라도 이슈 목록과 통계 조회는 가능합니다. Source Map이 필요할 때만 빌드용 토큰과 업로드 대상을 별도로 구성하십시오.

---

## 9. 배포 환경 설정

배포된 TraceHub 링크만 전달해서는 사용자가 브라우저에서 환경변수를 입력할 수 없습니다. TraceHub를 배포하는 관리자가 Vercel 등 배포 플랫폼의 서버 환경변수에 값을 설정해야 합니다.

Vercel 기준 절차:

1. 프로젝트의 **Settings → Environment Variables**로 이동합니다.
2. `NEXT_SENTRY_API_TOKEN`, `NEXT_SENTRY_ORG`, `NEXT_SENTRY_PROJECT`를 추가합니다.
3. 필요한 환경(Production, Preview, Development)을 선택합니다.
4. 기존 배포에는 자동 반영되지 않으므로 재배포합니다.
5. 배포 후 `/api/sentry/test`, `/api/sentry/issues` 순서로 검증합니다.

여러 사용자가 서로 다른 Sentry 프로젝트를 조회해야 한다면 현재처럼 배포 단위 환경변수만 사용하는 구조로는 사용자별 설정을 지원할 수 없습니다. 사용자별 자격 증명 저장, 암호화, 권한 분리, 프로젝트 선택 기능을 별도로 설계해야 합니다.

---

## 10. 보안 체크리스트

- [ ] 실제 토큰과 DSN을 Git에 커밋하지 않았습니다.
- [ ] 문서·이슈·PR·스크린샷에 실제 환경변수 값이 보이지 않습니다.
- [ ] API Token에 필요한 읽기 권한만 부여했습니다.
- [ ] `NEXT_SENTRY_API_TOKEN`에 `NEXT_PUBLIC_` 접두사를 붙이지 않았습니다.
- [ ] 토큰을 브라우저 코드, URL 쿼리, 로그에 포함하지 않았습니다.
- [ ] 팀원이 퇴사하거나 토큰이 노출되면 즉시 폐기 후 재발급합니다.
- [ ] Production과 Development 프로젝트 또는 environment를 구분했습니다.
- [ ] Sentry에 전송되는 사용자 정보가 조직의 개인정보 정책을 따릅니다.
- [ ] 공개 테스트 에러 엔드포인트와 의도적 예외 코드를 제거했습니다.
- [ ] 배포 플랫폼에서 Secret 권한과 접근 기록을 관리합니다.

`.env`가 `.gitignore`에 포함되어 있더라도 이미 커밋된 비밀값은 보호되지 않습니다. 노출된 토큰은 Git 기록에서 지우는 것만으로 끝내지 말고 Sentry에서 반드시 폐기하고 새로 발급하십시오.

---

## 11. 현재 지원 범위와 제한

### 지원 기능

- Sentry SaaS 프로젝트 이슈 목록 조회
- 미해결·무시·해결 상태 필터
- environment와 검색어 필터
- 5개 단위 cursor 무한스크롤
- 이슈 상세 정보와 기간별 발생 추이
- 브라우저·OS·환경 태그 분포
- 상태 코드·에러 타입·발생 위치 분석
- 지정한 프로젝트 전체 에러를 대상으로 하는 Analysis
- API Token 기본 연결 확인

### 현재 제한

- Sentry API 호스트가 `https://sentry.io`로 고정되어 Self-hosted Sentry를 지원하지 않습니다.
- 한 배포에서 단일 Organization Slug와 Project Slug만 설정할 수 있습니다.
- 이슈 상태 변경·해결·담당자 지정 등 쓰기 기능은 제공하지 않습니다.
- 시간대는 KST(UTC+9)로 고정되어 있습니다.
- Overview 통계는 프로젝트가 아닌 조직 전체 오류를 포함할 수 있습니다.
- 분류 기준은 단순 규칙 기반이며 Sentry regression이나 기간 대비 증가율을 사용하지 않습니다.
- 연결 테스트는 조직 목록 API만 검사하므로 전체 연동 상태를 보장하지 않습니다.
- Sentry API 요청은 기본 10초 후 중단됩니다.
- 이슈 목록의 environment와 HTTP 상태 코드를 위해 이슈별 추가 태그 요청이 발생합니다.

### 최종 점검표

아래 항목이 모두 충족되면 기본 연동이 완료된 것입니다.

- [ ] 대상 앱의 테스트 에러가 Sentry Issues에 표시됩니다.
- [ ] TraceHub 필수 환경변수 3개를 설정했습니다.
- [ ] `/api/sentry/test`가 `{ "connected": true }`를 반환합니다.
- [ ] `/api/sentry/issues`가 지정 프로젝트의 데이터를 반환합니다.
- [ ] Trends에서 상태·환경 필터가 동작합니다.
- [ ] 에러 상세에서 이슈별 통계와 태그가 표시됩니다.
- [ ] Overview의 조직 단위 집계와 Analysis의 프로젝트 전체 집계 범위를 구분했습니다.
- [ ] 실제 비밀값이 저장소와 문서에 노출되지 않았습니다.

## 참고 자료

- [Sentry Next.js 공식 문서](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry API 인증 문서](https://docs.sentry.io/api/auth/)
- [Sentry Web API 문서](https://docs.sentry.io/api/)
- [Sentry Source Map 문서](https://docs.sentry.io/platforms/javascript/sourcemaps/)

> 이 가이드는 TraceHub의 현재 구현을 기준으로 작성되었습니다. Sentry 콘솔의 메뉴명과 토큰 권한 표시는 Sentry 업데이트 또는 계정 권한에 따라 달라질 수 있습니다.
