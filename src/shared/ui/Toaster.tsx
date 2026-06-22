"use client"

import type { CSSProperties, ReactElement } from "react"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkCircle02Icon, InformationCircleIcon, Alert02Icon, MultiplicationSignCircleIcon, Loading03Icon } from "@hugeicons/core-free-icons"

const Toaster = ({ ...props }: ToasterProps): ReactElement => {
  return (
    <Sonner
      theme="light"
      position="top-center"
      className="toaster group"
      icons={{
        success: (
          <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-4" />
        ),
        info: (
          <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={2} className="size-4" />
        ),
        warning: (
          <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} className="size-4" />
        ),
        error: (
          <HugeiconsIcon icon={MultiplicationSignCircleIcon} strokeWidth={2} className="size-4" />
        ),
        loading: (
          <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} className="size-4 animate-spin" />
        ),
      }}
      // sonner 내부 CSS 변수는 Tailwind 유틸리티로 오버라이드 불가 — inline style 필수
      style={
        {
          "--border-radius": "var(--radius-md)",
          "--normal-bg": "var(--color-bg-card)",
          "--normal-text": "var(--color-text-primary)",
          "--normal-border": "var(--color-border-base)",
        } as CSSProperties
      }
      toastOptions={{
        duration: 2000,
        classNames: {
          success: "!bg-success !border-success !text-white",
          error: "!bg-error !border-error !text-white",
          warning: "!bg-warning !border-warning !text-white",
          info: "!bg-primary !border-primary !text-white",
        },
      }}
      {...props}
    />
  )
}

export default Toaster
