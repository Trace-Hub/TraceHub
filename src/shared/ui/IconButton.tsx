"use client";

import {cn} from '@/shared/lib/utils'

interface IconButtonProps {
    children: React.ReactNode
    onClick: () => void
    'aria-label': string
    className?: string
    disabled?: boolean
}

const IconButton = ({children, onClick, 'aria-label': ariaLabel, className, disabled}: IconButtonProps) => {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={ariaLabel}
            disabled={disabled}
            className={cn(
                'flex items-center justify-center w-fit h-fit',
                'rounded-md',
                'hover:scale-110 active:scale-95',
                'transition-[transform_150ms_ease]',
                'disabled:hover:scale-100 disabled:active:scale-100 disabled:*:opacity-50 disabled:cursor-not-allowed',
                className,
            )}
        >
            {children}
        </button>
    )
}

export default IconButton
