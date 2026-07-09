import {cn} from '@/shared/lib/utils'

interface CodeBlockProps {
    code: string
    className?: string
}

const CodeBlock = ({code, className}: CodeBlockProps) => {
    return (
        <div
            className={cn(
                'w-full h-fit overflow-clip',
                'border border-border-base',
                'rounded-xl',
                'bg-bg-subtle',
                'p-4',
                className,
            )}
        >
            <pre
                aria-label={'code block'}
                className="h-auto overflow-x-auto"
            >
                <code
                    className="font-[Cousine] font-normal text-body2 leading-4.25 text-text-primary whitespace-pre-wrap"
                >
                    {code}
                </code>
            </pre>
        </div>
    )
}

export default CodeBlock
