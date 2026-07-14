# 📌 프로젝트 개요
<img width="149" height="56" alt="image" src="https://github.com/user-attachments/assets/3a8f3dce-3c17-412f-a23f-65826cc89452" />

트레이스 허브는 에러 추적과 사용자 이벤트 모니터링을 한 곳에서 관리하는 어드민 대시보드로
Sentry와 PostHog 데이터를 통합하여 서비스의 상태를 실시간으로 파악하고 분석할 수 있습니다.

<!--메인 대시보드 스크린샷 넣을 자리 -->
<img width="1535" height="942" alt="image" src="https://github.com/user-attachments/assets/49d17cf5-6a33-4c1a-827e-6a7777ebb950" />

## 📎 배포 링크
https://trace-hub-seven.vercel.app/dashboard

## 👥 팀원 소개

| 이혁준 |박근원|
| :---: | :---: |
| <img width="150" height="150" alt="image" src="https://github.com/user-attachments/assets/83a198ba-fe78-4962-b8e9-e3e7cf00d681" /> <br/>[@Lilium0422](https://github.com/Lilium0422)|<img width="150" height="150" alt="image" src="https://github.com/user-attachments/assets/e7f01a51-3bb2-4aed-965c-12596d6a656d" /> <br/>[@Geunone2](https://github.com/Geunone2) |
| 메인 대시보드, 에러 대시보드 개발, <br>테마(라이트/다크 모드) 구현 | 기획 및 디자인 총괄,</br> 이벤트 대시보드, 환경설정 개발 |

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
![Zustand](https://img.shields.io/badge/Zustand_v5-433E38?style=for-the-badge&logo=zustand&logoColor=white)

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

## ✨ 주요 기능 

## **메인 대시보드**
  - 최신 발생 에러/이벤트 확인 가능
  - 에러/이벤트 발생 추이 차트 : 당일/7일/30일 간의 발생 빈도 열람 가능
    <img width="900" height="600" alt="image" src="https://github.com/user-attachments/assets/2e7da34d-c5f0-4ab2-99a2-3f90305b6f6a" />


## **이벤트 대시보드** — PostHog 기반 사용자 이벤트 실시간 추적 
  
- **Trends 페이지**
    - Posthog 기반 활성 사용자, 이벤트 발생 횟수, 전체 이벤트 발생 추이 차트, 각 이벤트별 차트
  <img width="1337" height="858" alt="image" src="https://github.com/user-attachments/assets/6067d991-0eab-413a-8642-1f58dcb8e8c4" />

- **Trends 상세 페이지** - 이벤트별 차트 클릭 시 접근
  - 이벤트 요약 카드
  - 시간대별 발생 현황 차트
  - 페이지별 발생 현황 차트
  - 속성별 분포 차트( 브라우저 / OS / 페이지 경로 / 직전 경로 )
  <img width="1694" height="928" alt="image" src="https://github.com/user-attachments/assets/e2cfaa77-0c6c-45a9-89a2-f92c5b5aeee8" />
  <img width="1683" height="264" alt="image" src="https://github.com/user-attachments/assets/0526f12e-716e-4fed-acaf-ad126324622a" />



- **Lifecycle 페이지**
  - 이벤트 통한 사용자 유형 분석
  <img width="1706" height="841" alt="image" src="https://github.com/user-attachments/assets/573b98ca-862e-4439-9bfb-fd93582da87d" />

- **Retention 페이지**
  - 사용자를 그룹화하여 재방문 비율 추적
  <img width="1707" height="871" alt="image" src="https://github.com/user-attachments/assets/ba078c46-6284-4b0c-b2b7-fe6a488253e8" />

- **Funnels 페이지** 
  - 사용자의 플로우를 정의하여 단계별 전환율 분석
  <img width="1706" height="790" alt="image" src="https://github.com/user-attachments/assets/d6782c74-da38-4588-8f85-df9a75836f96" />

- **Paths 페이지**
  - 사용자 페이지 경로 분석
  <img width="1709" height="645" alt="image" src="https://github.com/user-attachments/assets/057165f7-161b-473e-895a-b7edad6862a8" />
 

## **에러 대시보드** — Sentry 기반 에러 실시간 조회

  - **Trends 페이지**
    - Sentry Issue 기반 발생 에러 조회
    <img width="1688" height="904" alt="image" src="https://github.com/user-attachments/assets/68ecfe46-02bf-4b3e-a907-94af6e95066f" />
 
  - **Trneds 상세 페이지** - 에러 카드 클릭 시 접근
    - 에러 요약 카드
    - 시간대별 발생 현황 차트
    - 환경별 분포 차트( 브라우저/ OS )
    <img width="1685" height="902" alt="image" src="https://github.com/user-attachments/assets/826cf58b-63b1-4da9-9f69-261994913448" />

  - **Analysis 페이지**
    - 분류별 통계 (에러 카드의 뱃지 분류)
    - 상태 코드별 차트 / 에러 타입별 차트
    - 에러 발생 위치 top 5 차트
    <img width="1702" height="849" alt="image" src="https://github.com/user-attachments/assets/101b99a7-20ff-4e91-b134-61ba273c5594" />


## **환경설정**
  - **테마 변경** — 라이트/다크 모드 or 시스템 전환 기능 구현
  - **연동 상태 확인** — Sentry/PostHog 연결 상태 체크 및 설정 가이드
    <img width="1703" height="753" alt="image" src="https://github.com/user-attachments/assets/926a8136-d2de-4b38-a084-ed142f9f9195" />


## 시작하기

### 요구사항

- Node.js 20+
- pnpm 10+

### 설치

```bash
pnpm install
```

### 환경변수 설정

- `.env` 파일을 프로젝트 루트에 생성하고 환경변수를 설정합니다.
- 실행 후 Settings 페이지의 **설정 가이드** 참고



### 실행

```bash
pnpm dev
```

`http://localhost:3000/dashboard`에서 확인할 수 있습니다.

### 기타 스크립트

```bash
pnpm build        # 프로덕션 빌드
pnpm type-check   # 타입 체크
pnpm lint         # ESLint
```

## 페이지 구성

| 경로                          | 설명                                         |
| ----------------------------- | -------------------------------------------- |
| `/dashboard`                  | 메인 Overview (에러·이벤트 요약 + 추이 차트) |
| `/dashboard/events`           | 이벤트 트렌드 (KPI, 카테고리별 필터)         |
| `/dashboard/events/lifecycle` | 사용자 라이프사이클 분석                     |
| `/dashboard/events/retention` | 리텐션 코호트 분석                           |
| `/dashboard/events/funnels`   | 전환 퍼널 시각화                             |
| `/dashboard/events/paths`     | 사용자 네비게이션 경로 분석                  |
| `/dashboard/errors/list`      | 에러 목록 (무한스크롤, 필터, 검색)           |
| `/dashboard/errors/analysis`  | 에러 통계 (상태코드별, 타입별, 핫스팟)       |
| `/dashboard/errors/[id]`      | 에러 상세 (태그, 시간별 추이)                |
| `/dashboard/settings`         | 테마 설정, 연동 상태 확인                    |

## 📁 프로젝트 구조

FSD(Feature-Sliced Design) 기반 아키텍처를 사용합니다.

```
src/
├── app-init/      # Provider, 글로벌 설정
├── views/         # 페이지 단위 뷰 컴포넌트
├── widgets/       # 복합 UI 블록 (차트, 통계 카드)
├── features/      # 독립적 기능 단위 (설정 등)
├── entities/      # 도메인 모델 (error, event)
└── shared/        # 공용 UI, hooks, API 클라이언트, 설정
```
