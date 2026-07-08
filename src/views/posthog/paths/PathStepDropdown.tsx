"use client"

import type { ReactElement } from "react"
import type { PathStepCount } from "@/entities/event/model/paths"
import { VALID_PATH_STEP_COUNTS } from "@/entities/event/model/paths"
import Dropdown from "@/shared/ui/Dropdown"

const STEP_OPTIONS: { value: string; label: string }[] = VALID_PATH_STEP_COUNTS.map((n) => ({
	value: String(n),
	label: `${n} Step${n > 1 ? "s" : ""}`,
}))

interface PathStepDropdownProps {
	value: PathStepCount
	onChange: (value: PathStepCount) => void
	className?: string
}

const PathStepDropdown = ({ value, onChange, className }: PathStepDropdownProps): ReactElement => (
	<Dropdown
		value={String(value)}
		// Dropdown의 값 타입은 string으로 고정되어 있어, 여기서 다시 PathStepCount로
		// 좁혀야 한다 — VALID_PATH_STEP_COUNTS에서 생성한 옵션만 노출하므로 항상 안전하다
		onChange={(v) => onChange(Number(v) as PathStepCount)}
		options={STEP_OPTIONS}
		ariaLabel="단계 수 선택"
		className={className}
	/>
)

export default PathStepDropdown
