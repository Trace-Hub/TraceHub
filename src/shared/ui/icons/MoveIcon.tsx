import Image from 'next/image'
import {iconClass} from '@/shared/lib/iconUtils'

interface IconProps {
    className?: string
}

const MoveIcon = ({className}: IconProps) => {
    return (
        <div className={iconClass(className)}>
            <Image src="/assets/MoveIcon.svg" alt="Move" width={16} height={16} />
        </div>
    )
}

export default MoveIcon
