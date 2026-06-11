"use client"

import { animate } from "motion/react"
import type { ReactElement } from "react"
import { useEffect, useRef, useState } from "react"

interface AnimatedNumberProps {
	value: number
	format: (v: number) => string
	className?: string
}

const AnimatedNumber = ({ value, format, className }: AnimatedNumberProps): ReactElement => {
	// 0에서 시작 — 첫 로드 시 0→실제값 카운팅, 이후 리패치 시 이전값→새값으로 전환
	const [display, setDisplay] = useState(0)
	const fromRef = useRef(0)
	const latestDisplayRef = useRef(0)

	useEffect(() => {
		const from = fromRef.current
		const controls = animate(from, value, {
			duration: 1.2,
			ease: "easeOut",
			onUpdate: (v) => {
				latestDisplayRef.current = v
				setDisplay(v)
			},
			// fromRef는 애니메이션 완료 후 갱신 — effect 본문에서 즉시 갱신하면
			// StrictMode 이중 실행 시 두 번째 effect가 from===value로 동작해 애니메이션이 건너뜀
			onComplete: () => {
				fromRef.current = value
			},
		})
		return () => {
			// controls.stop()은 onComplete를 호출하지 않으므로 중단 시점의 표시값으로 직접 동기화
			fromRef.current = latestDisplayRef.current
			controls.stop()
		}
	}, [value])

	return <span className={className}>{format(display)}</span>
}

export default AnimatedNumber
