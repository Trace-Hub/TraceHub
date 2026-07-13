import {cn} from '@/shared/lib/utils'
import {Spinner} from '@/shared/ui/spinner'
import {HugeiconsIcon} from '@hugeicons/react'
import {CheckmarkCircle02Icon, MultiplicationSignCircleIcon} from '@hugeicons/core-free-icons'

interface ConnectionStatusBoxProps {
    status: 'idle' | 'loading' | 'success' | 'failed'
    message?: string
    projectName?: string
    permission?: string
    className?: string
}

const variantConfig = {
    idle: {
        containerClass: 'border border-border-base bg-bg-subtle text-text-secondary',
        indicator: null,
    },
    loading: {
        containerClass: 'border border-border-base bg-bg-subtle text-text-secondary',
        indicator: 'spinner',
    },
    success: {
        containerClass: 'border border-success-subtle bg-success-subtle text-success',
        indicator: 'icon-success',
    },
    failed: {
        containerClass: 'border border-error-subtle bg-error-subtle text-error',
        indicator: 'icon-error',
    },
} as const

const ConnectionStatusBox = ({
                                 status,
                                 message,
                                 projectName,
                                 permission,
                                 className,
                             }: ConnectionStatusBoxProps) => {
    const {containerClass, indicator} = variantConfig[status]

    const textContent = {
        idle: '연결 테스트를 진행하지 않았습니다.',
        loading: message ?? '연결 테스트 중..',
        success: `연결 성공${projectName ? ` · ${projectName}` : ''}${permission ? ` · ${permission}` : ''}`,
        failed: `연결 실패${message ? ` · ${message}` : ''}`,
    }[status]

    return (
        <div
            role="status"
            aria-live="polite"
            className={cn(
                'flex flex-row items-center gap-2 px-4 py-3 rounded-md text-body2 leading-normal font-medium',
                containerClass,
                className,
            )}
        >
            {indicator === 'spinner' && <Spinner/>}
            {indicator === 'icon-success' && (
                <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-4 shrink-0" color="currentColor"/>
            )}
            {indicator === 'icon-error' && (
                <HugeiconsIcon icon={MultiplicationSignCircleIcon} strokeWidth={2} className="size-4 shrink-0" color="currentColor"/>
            )}
            <span>{textContent}</span>
        </div>
    )
}

export default ConnectionStatusBox
