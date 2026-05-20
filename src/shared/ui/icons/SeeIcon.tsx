import Image from 'next/image'
import {cn} from '@/shared/lib/utils'
import {iconClass} from '@/shared/lib/iconUtils'

interface IconProps {
    className?: string
}

const SeeIcon = ({className}: IconProps) => {
    return (
        <div className={iconClass(cn("border-0 rounded-none", className))}>
            <Image src="/assets/SeeIcon.svg" alt="See Token" width={16} height={16}/>
        </div>
    )
}

export default SeeIcon;
