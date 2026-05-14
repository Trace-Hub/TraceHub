import {cn} from '@/shared/lib/utils'

export function iconClass(className?: string): string {
    return cn(
        'flex flex-row items-center justify-center w-8 h-8 border-1 border-border-base rounded-sm',
        className,
    )
}
