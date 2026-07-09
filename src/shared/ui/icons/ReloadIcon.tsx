import Image from 'next/image'
import {iconClass} from '@/shared/lib/iconUtils'

interface IconProps {
    className?: string
}

const ReloadIcon = ({className}: IconProps) => {
    return (
        <div className={iconClass(className)}>
            <Image src="/assets/ReloadIcon.svg" alt="Reload" width={16} height={16} />
        </div>
    )
}

export default ReloadIcon
