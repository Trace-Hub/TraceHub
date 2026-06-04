"use client"

import { animate } from "motion/react"
import { useEffect, useRef, useState } from "react"

interface AnimatedNumberProps {
	value: number
	format: (v: number) => string
	className?: string
}

const AnimatedNumber = ({ value, format, className }: AnimatedNumberProps) => {
	// 0에서 시작 — 첫 로드 시 0→실제값 카운팅, 이후 리패치 시 이전값→새값으로 전환
	const [display, setDisplay] = useState(0)
	const fromRef = useRef(0)

	useEffect(() => {
		const from = fromRef.current
		const controls = animate(from, value, {
			duration: 1.2,
			ease: "easeOut",
			onUpdate: (v) => setDisplay(v),
		})
		fromRef.current = value
		return controls.stop
	}, [value])

	return <span className={className}>{format(display)}</span>
}

export default AnimatedNumber
