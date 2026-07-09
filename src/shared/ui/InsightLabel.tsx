import {cn} from '@/shared/lib/utils'

interface InsightLabelProps {
    variant: 'fact' | 'comparison' | 'action'
    text?: string
    className?: string
}

const variantConfig = {
    fact: {
        label: '[사실]',
        borderLeftClass: 'border-l-primary',
        textClass: 'text-primary',
    },
    comparison: {
        label: '[비교]',
        borderLeftClass: 'border-l-success',
        textClass: 'text-success',
    },
    action: {
        label: '[행동]',
        borderLeftClass: 'border-l-surge',
        textClass: 'text-surge',
    },
} as const

const InsightLabel = ({variant, text, className}: InsightLabelProps) => {
    const {label, borderLeftClass, textClass} = variantConfig[variant]

    return (
        <div
            className={cn(
                'w-full h-fit flex flex-row items-start justify-start gap-2',
                'px-2 py-3',
                'border-l-4 rounded-xs',
                'bg-bg-subtle',
                'font-medium text-xs leading-4 tracking-widest text-left',
                borderLeftClass,
                textClass,
                className,
            )}
        >
            <span>{label}</span>
            {text && (
                <span className="text-body2 font-normal text-text-primary tracking-normal">
                    {text}
                </span>
            )}
        </div>
    )
}

export default InsightLabel
