import {cn} from '@/shared/lib/utils'
import {Spinner} from '@/shared/ui/spinner'

interface ConnectionStatusBoxProps {
    status: 'idle' | 'loading' | 'success' | 'failed'
    message?: string
    projectName?: string
    permission?: string
    className?: string
}

const variantConfig = {
    idle: {
        containerClass: 'border border-border-base bg-bg-subtle',
        indicator: null,
    },
    loading: {
        containerClass: '',
        indicator: 'spinner',
    },
    success: {
        containerClass: 'bg-success-subtle',
        indicator: 'dot-success',
    },
    failed: {
        containerClass: 'bg-error-subtle',
        indicator: 'dot-error',
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
                'flex flex-row items-center gap-2 px-4 py-3 rounded-md text-body2 leading-normal font-normal text-text-primary',
                containerClass,
                className,
            )}
        >
            {indicator === 'spinner' && <Spinner/>}
            {indicator === 'dot-success' && <span className="w-2 h-2 rounded-full shrink-0 bg-success"/>}
            {indicator === 'dot-error' && <span className="w-2 h-2 rounded-full shrink-0 bg-error"/>}
            <span>{textContent}</span>
        </div>
    )
}

export default ConnectionStatusBox
