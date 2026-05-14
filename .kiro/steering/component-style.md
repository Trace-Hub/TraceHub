---
inclusion: always
---

# 컴포넌트 제작 규칙

컴포넌트를 만들거나 수정할 때 반드시 아래 가이드를 따라야 합니다.

## 필수 참조

#[[file:src/docs/COMPONENT_STYLE_GUIDE.md]]

## 지시사항

- 새 컴포넌트를 만들기 전에 `src/shared/ui/`에 유사 컴포넌트가 있는지 먼저 확인할 것
- 모든 공용 컴포넌트는 `className?: string` props를 포함하고 `cn()` 유틸로 병합할 것
- 색상은 반드시 CSS 변수(`var(--color-*)`)로만 참조하고, 하드코딩된 색상값(`#3B82F6` 등) 사용 금지
- `index.ts` 배럴 파일 생성 금지 — 파일명 = 함수명 규칙을 따를 것
- `any` 타입 사용 금지
