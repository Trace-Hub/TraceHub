import {cn} from '@/shared/lib/utils'

interface ConnectionStatusBadgeProps {
    variant: 'connected' | 'disconnected' | 'failed'
    className?: string
}

const variantConfig = {
    connected: {
        dotClass: 'bg-success',
        colorClass: 'text-success',
        label: '연결됨',
    },
    disconnected: {
        dotClass: 'bg-border-base',
        colorClass: 'text-text-secondary',
        label: '연결 안 됨',
    },
    failed: {
        dotClass: 'bg-error',
        colorClass: 'text-error',
        label: '연결 실패',
    },
} as const

const ConnectionStatusBadge = ({variant, className}: ConnectionStatusBadgeProps) => {
    const {dotClass, colorClass, label} = variantConfig[variant]

    return (
        <span
            className={cn(
                'inline-flex flex-row w-fit rounded-lg items-center gap-1.5 px-2 py-1 border bg-bg-subtle border-border-base text-label font-medium',
                colorClass,
                className,
            )}
        >
      <span className={cn('w-1.5 h-1.5 rounded-full', dotClass)}/>
            {label}
    </span>
    )
}

export default ConnectionStatusBadge
