import Image from 'next/image'
import {iconClass} from '@/shared/lib/iconUtils'

interface IconProps {
    className?: string
}

const SettingIcon = ({className}: IconProps) => {
    return (
        <div className={iconClass(className)}>
            <Image src="/assets/SettingIcon.svg" alt="Setting" width={16} height={16}/>
        </div>
    )
}

export default SettingIcon
