# Component Style Guide

## 공통 Props 패턴
모든 공용 컴포넌트는 아래 Props를 기본으로 포함한다.
- className?: string (cn() 유틸로 외부 클래스 병합)

## 색상 참조 규칙
- 색상은 반드시 CSS 변수로만 참조
- 하드코딩 금지
- 예: color: var(--color-primary) ✅ / color: #3B82F6 ❌

## 금지 사항
- index.ts 배럴 파일 생성 금지
- 하드코딩된 색상값 사용 금지
- any 타입 사용 금지