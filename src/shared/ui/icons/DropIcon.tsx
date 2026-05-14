import Image from 'next/image'
import {iconClass} from '@/shared/lib/iconUtils'

interface IconProps {
    className?: string
}

const DropIcon = ({className}: IconProps) => {
    return (
        <div className={iconClass(className)}>
            <Image src="/assets/DropIcon.svg" alt="Drop" width={16} height={16}/>
        </div>
    )
}

export default DropIcon
