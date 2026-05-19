"use client"

import {useState} from "react"
import {cn} from "@/shared/lib/utils"
import SeeIcon from "@/shared/ui/icons/SeeIcon";

interface AuthInputGroupProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
    variant: "sentry" | "event"
}

const variantConfig = {
    sentry: {
        placeholder: "Sentry DSN 토큰을 입력하세요",
    },
    event: {
        placeholder: "Event 토큰을 입력하세요",
    },
} as const

const AuthInputGroup = ({value, onChange, placeholder, className, variant}: AuthInputGroupProps) => {
    const [isVisible, setIsVisible] = useState(false)
    const config = variantConfig[variant]

    return (
        <div className={cn("flex flex-row items-center w-full relative", className)}>
            <input
                type={isVisible ? "text" : "password"}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder ?? config.placeholder}
                className={cn(
                    "w-full",
                    "border border-border-base rounded-md",
                    "pl-3 pt-2 pb-2 pr-10",
                    "font-mono text-body2",
                    "placeholder:text-text-primary/50",
                    "outline-none bg-transparent",
                )}
            />
            <button
                type="button"
                onClick={() => setIsVisible((prev) => !prev)}
                className={cn(
                    "absolute right-3",
                    "text-text-tertiary hover:text-text-secondary",
                    isVisible && "opacity-50",
                )}
                aria-label={isVisible ? "토큰 숨기기" : "토큰 표시"}
            >
                <SeeIcon/>
            </button>
        </div>
    )
}

export default AuthInputGroup